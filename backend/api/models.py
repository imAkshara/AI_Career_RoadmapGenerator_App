from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    """Store user profile information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    skills = models.JSONField(default=list, help_text="List of user skills")
    interests = models.JSONField(default=list, help_text="List of user interests")
    
    EXPERIENCE_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    experience_level = models.CharField(
        max_length=20,
        choices=EXPERIENCE_CHOICES,
        default='beginner'
    )
    goal = models.TextField(help_text="User's career goal")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    class Meta:
        ordering = ['-created_at']

class CareerRoadmap(models.Model):
    """Store generated career roadmaps"""
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='roadmaps')
    title = models.CharField(max_length=255)
    description = models.TextField()
    roadmap_data = models.JSONField(help_text="Complete roadmap data structure", default=dict)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.user_profile.user.username}"
    
    def get_completion_percentage(self):
        """Calculate completion percentage"""
        total_steps = self.steps.count()
        if total_steps == 0:
            return 0
        completed_steps = self.steps.filter(is_completed=True).count()
        return round((completed_steps / total_steps) * 100)
    
    class Meta:
        ordering = ['-created_at']

class RoadmapStep(models.Model):
    """Individual steps within a roadmap"""
    roadmap = models.ForeignKey(CareerRoadmap, on_delete=models.CASCADE, related_name='steps')
    order = models.IntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField()
    resources = models.JSONField(default=list)
    milestones = models.JSONField(default=list)
    estimated_time = models.CharField(max_length=100, blank=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order']
        unique_together = ['roadmap', 'order']
    
    def __str__(self):
        return f"Step {self.order}: {self.title}"
    
    def mark_complete(self):
        """Mark step as complete and set completion time"""
        self.is_completed = True
        self.completed_at = timezone.now()
        self.save()

class UserProgress(models.Model):
    """Track user progress through roadmap steps"""
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='progress')
    step = models.ForeignKey(RoadmapStep, on_delete=models.CASCADE, related_name='progress_records')
    is_completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user_profile', 'step']
        ordering = ['step__order']
    
    def __str__(self):
        return f"{self.user_profile.user.username} - {self.step.title}"
    
    def mark_complete(self):
        """Mark progress as complete"""
        self.is_completed = True
        self.completed_at = timezone.now()
        self.save()
        # Also mark the step as complete
        self.step.mark_complete()