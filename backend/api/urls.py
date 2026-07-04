from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from . import views

router = DefaultRouter()
router.register(r'profiles', views.UserProfileViewSet)
router.register(r'roadmaps', views.CareerRoadmapViewSet)
router.register(r'steps', views.RoadmapStepViewSet)
router.register(r'progress', views.UserProgressViewSet)

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', views.LoginView.as_view(), name='auth_login'),
    path('auth/register/', views.RegisterView.as_view(), name='auth_register'),
    path('auth/logout/', views.LogoutView.as_view(), name='auth_logout'),
    path('auth/user/', views.CurrentUserView.as_view(), name='auth_user'),
    path('auth/token/', obtain_auth_token, name='auth_token'),
    
    # API endpoints
    path('', include(router.urls)),
    path('roadmaps/generate/', views.CareerRoadmapViewSet.as_view({'post': 'generate'}), name='generate_roadmap'),
    
    # Chatbot endpoint
    path('chat/', views.ChatView.as_view(), name='chat'),  # <-- NEW
]