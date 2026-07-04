from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from .models import UserProfile, CareerRoadmap, RoadmapStep, UserProgress
from .serializers import (
    UserSerializer, UserProfileSerializer, CareerRoadmapSerializer,
    RoadmapStepSerializer, UserProgressSerializer
)
from .utils import generate_roadmap_with_ai
import logging
import random

logger = logging.getLogger(__name__)

# Try to import openai – gracefully handle if missing
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    openai = None

# ============ AUTHENTICATION VIEWS ============

class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        })

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            with transaction.atomic():
                user = User.objects.create_user(username=username, email=email, password=password)
                UserProfile.objects.create(user=user, skills=[], interests=[], experience_level='beginner', goal='')
                token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': {'id': user.id, 'username': user.username, 'email': user.email}
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Registration failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            request.user.auth_token.delete()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except:
            return Response({'error': 'Logout failed'}, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        try:
            profile = UserProfile.objects.get(user=user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)

# ============ USER PROFILE VIEWS ============

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    @action(detail=False, methods=['post'])
    def create_or_update(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ============ ROADMAP VIEWS ============

class CareerRoadmapViewSet(viewsets.ModelViewSet):
    queryset = CareerRoadmap.objects.all()
    serializer_class = CareerRoadmapSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return self.queryset.filter(user_profile__user=self.request.user).order_by('-created_at')
    def perform_create(self, serializer):
        profile = get_object_or_404(UserProfile, user=self.request.user)
        serializer.save(user_profile=profile)
    @action(detail=False, methods=['post'])
    def generate(self, request):
        try:
            profile = get_object_or_404(UserProfile, user=request.user)
            if not profile.skills:
                return Response({'error': 'Please add your skills first'}, status=status.HTTP_400_BAD_REQUEST)
            if not profile.goal:
                return Response({'error': 'Please set your career goal'}, status=status.HTTP_400_BAD_REQUEST)
            roadmap_data = generate_roadmap_with_ai(
                skills=profile.skills,
                interests=profile.interests,
                experience_level=profile.experience_level,
                goal=profile.goal
            )
            with transaction.atomic():
                roadmap = CareerRoadmap.objects.create(
                    user_profile=profile,
                    title=roadmap_data.get('title', 'Your Career Roadmap'),
                    description=roadmap_data.get('description', ''),
                    roadmap_data=roadmap_data
                )
                for idx, step_data in enumerate(roadmap_data.get('steps', [])):
                    RoadmapStep.objects.create(
                        roadmap=roadmap,
                        order=idx,
                        title=step_data.get('title', f'Step {idx + 1}'),
                        description=step_data.get('description', ''),
                        resources=step_data.get('resources', []),
                        milestones=step_data.get('milestones', []),
                        estimated_time=step_data.get('estimated_time', '')
                    )
                for step in roadmap.steps.all():
                    UserProgress.objects.create(user_profile=profile, step=step, is_completed=False)
            serializer = self.get_serializer(roadmap)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Failed to generate roadmap: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        roadmap = self.get_object()
        progress = UserProgress.objects.filter(step__roadmap=roadmap, user_profile__user=request.user)
        serializer = UserProgressSerializer(progress, many=True)
        return Response(serializer.data)

# ============ ROADMAP STEP VIEWS ============

class RoadmapStepViewSet(viewsets.ModelViewSet):
    queryset = RoadmapStep.objects.all()
    serializer_class = RoadmapStepSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return self.queryset.filter(roadmap__user_profile__user=self.request.user)
    @action(detail=True, methods=['post'])
    def toggle_complete(self, request, pk=None):
        step = self.get_object()
        step.is_completed = not step.is_completed
        if step.is_completed:
            step.completed_at = timezone.now()
        else:
            step.completed_at = None
        step.save()
        progress = UserProgress.objects.get(user_profile__user=request.user, step=step)
        progress.is_completed = step.is_completed
        progress.completed_at = step.completed_at
        progress.save()
        return Response({'status': 'updated'})

# ============ USER PROGRESS VIEWS ============

class UserProgressViewSet(viewsets.ModelViewSet):
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return self.queryset.filter(user_profile__user=self.request.user)
    def perform_create(self, serializer):
        profile = get_object_or_404(UserProfile, user=self.request.user)
        serializer.save(user_profile=profile)
    @action(detail=True, methods=['post'])
    def toggle_complete(self, request, pk=None):
        progress = self.get_object()
        progress.is_completed = not progress.is_completed
        if progress.is_completed:
            progress.completed_at = timezone.now()
        else:
            progress.completed_at = None
        progress.save()
        step = progress.step
        step.is_completed = progress.is_completed
        step.completed_at = progress.completed_at
        step.save()
        return Response({'status': 'updated'})

# ============ CHATBOT VIEW ============

class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        if not user_message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        profile = request.user.profile if hasattr(request.user, 'profile') else None
        context = {
            'skills': profile.skills if profile else [],
            'interests': profile.interests if profile else [],
            'goal': profile.goal if profile else '',
        }

        try:
            if OPENAI_AVAILABLE and settings.OPENAI_API_KEY:
                try:
                    response_text = self._openai_response(user_message, context, request.user.username)
                except Exception as e:
                    # Fallback if OpenAI fails (e.g. quota exceeded, network error)
                    logger.warning(f"OpenAI API error: {str(e)}. Using fallback.")
                    response_text = self._fallback_response(user_message, context)
            else:
                response_text = self._fallback_response(user_message, context)
        except Exception as e:
            return Response({'error': f'Error generating response: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'response': response_text}, status=status.HTTP_200_OK)

    def _openai_response(self, message, context, username):
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        system_prompt = f"""You are a friendly and knowledgeable career advisor.
The user has provided:
- Skills: {', '.join(context['skills']) if context['skills'] else 'Not specified'}
- Interests: {', '.join(context['interests']) if context['interests'] else 'Not specified'}
- Career Goal: {context['goal'] if context['goal'] else 'Not specified'}
Provide helpful, actionable advice. Keep responses concise (max 150 words). Address the user as {username}."""
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=300
        )
        return response.choices[0].message.content.strip()

    def _fallback_response(self, message, context):
        msg = message.lower().strip()

        # ---- Career-specific intents ----
        if "ai engineer" in msg or "machine learning" in msg or "ml" in msg:
            return ("To become an AI Engineer, focus on Python, mathematics (linear algebra, calculus), and ML frameworks. "
                    "Start with Andrew Ng's ML course, build projects (e.g., image classifier), and practice on Kaggle. "
                    "A strong foundation in data structures and algorithms is also key.")

        if "web developer" in msg or "full stack" in msg or "frontend" in msg or "backend" in msg:
            return ("For web development, learn HTML, CSS, JavaScript, and a framework like React or Angular. "
                    "For backend, pick Node.js, Django, or Spring Boot. Build projects, contribute to open source, "
                    "and create a portfolio to showcase your work.")

        if "data science" in msg or "data analyst" in msg or "analytics" in msg:
            return ("Data Science requires Python/R, SQL, statistics, and data visualization (Tableau, Power BI). "
                    "Learn pandas, numpy, and scikit-learn. Practice with real datasets on Kaggle or UCI repository.")

        if "cybersecurity" in msg or "security" in msg or "ethical hacking" in msg:
            return ("Cybersecurity demands networking knowledge, operating systems, and scripting (Python, Bash). "
                    "Certifications like CompTIA Security+, CEH, or CISSP are valuable. Practice on TryHackMe or Hack The Box.")

        if "cloud" in msg or "aws" in msg or "azure" in msg or "devops" in msg:
            return ("Cloud/DevOps roles require AWS/Azure/GCP, Linux, Docker, Kubernetes, and CI/CD tools. "
                    "Start with the cloud provider's free tier, build projects, and consider certifications (AWS Solutions Architect).")

        if "mobile" in msg or "android" in msg or "ios" in msg or "flutter" in msg:
            return ("For mobile development, choose native (Kotlin/Swift) or cross-platform (Flutter, React Native). "
                    "Learn platform-specific design guidelines, build apps, and publish to app stores to showcase your work.")

        # ---- General topics ----
        if "roadmap" in msg or "plan" in msg or "path" in msg:
            return ("I recommend generating a personalized roadmap using our AI tool. "
                    "It will give you step‑by‑step guidance tailored to your skills and goals. "
                    "Go to the 'Generate' page to get started!")

        if "skill" in msg or "learn" in msg or "study" in msg or "course" in msg:
            skills_str = ', '.join(context['skills']) if context['skills'] else 'Python, React, or Data Science'
            return (f"Focus on building skills like {skills_str}. "
                    "Practice with hands‑on projects, contribute to open source, and take online courses (Coursera, Udemy). "
                    "Consistency is more important than intensity – code every day!")

        if "career" in msg or "job" in msg or "work" in msg or "interview" in msg:
            return ("Networking and building a strong portfolio are key. Update your LinkedIn, attend meetups, "
                    "and apply to positions that align with your goal. Practice coding interviews on LeetCode/HackerRank.")

        if "resume" in msg or "cv" in msg or "cover letter" in msg:
            return ("Tailor your resume to each job description, highlight measurable achievements, "
                    "and include a link to your GitHub/portfolio. Use action verbs and quantify your impact (e.g., 'improved performance by 20%').")

        if "salary" in msg or "pay" in msg or "compensation" in msg:
            return ("Salaries vary by location, experience, and company. Check Glassdoor, Levels.fyi, or LinkedIn for current market rates. "
                    "Remember that total compensation includes benefits, stock options, and bonuses.")

        if "hello" in msg or "hi" in msg or "hey" in msg:
            greetings = ["Hello! 👋 How can I assist your career journey today?", 
                         "Hi there! What career question do you have for me?",
                         "Hey! Ready to explore your career path? Ask me anything!"]
            return random.choice(greetings)

        # ---- Default with variation ----
        generic_responses = [
            "That's a great question! Could you be more specific? I'm here to help with career paths, skills, roadmaps, job hunting, and more.",
            "I'd love to help! Can you tell me more about what you're looking for – career switch, skill upgrade, interview prep, or something else?",
            "Interesting! To give you the best advice, please clarify: are you starting out, transitioning, or advancing in your career?",
            "Sure! Let's narrow it down – are you interested in a specific role, technology, or industry?"
        ]
        return random.choice(generic_responses)