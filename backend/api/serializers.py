from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, CareerRoadmap, RoadmapStep, UserProgress

class UserSerializer(serializers.ModelSerializer):
    """User serializer for authentication"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'skills', 'interests', 
                 'experience_level', 'goal', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class RoadmapStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadmapStep
        fields = ['id', 'order', 'title', 'description', 'resources', 
                 'milestones', 'estimated_time', 'is_completed', 
                 'completed_at', 'created_at']
        read_only_fields = ['created_at']

class CareerRoadmapSerializer(serializers.ModelSerializer):
    steps = RoadmapStepSerializer(many=True, read_only=True)
    progress_count = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    username = serializers.CharField(source='user_profile.user.username', read_only=True)
    
    class Meta:
        model = CareerRoadmap
        fields = ['id', 'username', 'title', 'description', 'roadmap_data',
                 'steps', 'progress_count', 'completion_percentage', 
                 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_progress_count(self, obj):
        total_steps = obj.steps.count()
        completed_steps = obj.steps.filter(is_completed=True).count()
        return {'total': total_steps, 'completed': completed_steps}
    
    def get_completion_percentage(self, obj):
        return obj.get_completion_percentage()

class UserProgressSerializer(serializers.ModelSerializer):
    step_title = serializers.CharField(source='step.title', read_only=True)
    roadmap_title = serializers.CharField(source='step.roadmap.title', read_only=True)
    
    class Meta:
        model = UserProgress
        fields = ['id', 'step', 'step_title', 'roadmap_title', 
                 'is_completed', 'notes', 'completed_at', 'updated_at']
        read_only_fields = ['updated_at']