import json
import os
import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

# Try to import openai
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI not installed. Using template roadmap generator.")

def generate_roadmap_with_ai(skills: List[str], interests: List[str], 
                            experience_level: str, goal: str) -> Dict[str, Any]:
    """
    Generate a career roadmap using AI or fallback to template
    """
    
    # Check if OpenAI is available and configured
    if OPENAI_AVAILABLE and os.getenv('OPENAI_API_KEY'):
        try:
            return generate_with_openai(skills, interests, experience_level, goal)
        except Exception as e:
            logger.error(f"OpenAI generation failed: {e}")
            return generate_template_roadmap(skills, interests, experience_level, goal)
    else:
        return generate_template_roadmap(skills, interests, experience_level, goal)

def generate_with_openai(skills: List[str], interests: List[str], 
                        experience_level: str, goal: str) -> Dict[str, Any]:
    """Generate roadmap using OpenAI API"""
    
    openai.api_key = os.getenv('OPENAI_API_KEY')
    
    prompt = f"""Generate a detailed career roadmap in JSON format for someone with:

Skills: {', '.join(skills) if skills else 'Not specified'}
Interests: {', '.join(interests) if interests else 'Not specified'}
Experience Level: {experience_level}
Career Goal: {goal}

Create a JSON object with this exact structure:
{{
    "title": "Your Career Roadmap Title",
    "description": "Brief description of the roadmap",
    "steps": [
        {{
            "title": "Step Title",
            "description": "Detailed description of what to do",
            "resources": ["Resource 1", "Resource 2"],
            "milestones": ["Milestone 1", "Milestone 2"],
            "estimated_time": "2-3 months"
        }}
    ]
}}

Provide 5-7 comprehensive steps. Make it specific to the user's goal and skills.
Return ONLY valid JSON. No additional text."""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert career advisor creating personalized career roadmaps. Return only JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500,
            timeout=30
        )
        
        content = response.choices[0].message.content
        
        # Extract JSON from response
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        if json_start != -1 and json_end != -1:
            json_str = content[json_start:json_end]
            return json.loads(json_str)
        else:
            raise ValueError("No valid JSON found in response")
            
    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        raise

def generate_template_roadmap(skills: List[str], interests: List[str], 
                             experience_level: str, goal: str) -> Dict[str, Any]:
    """Generate a template roadmap when AI is not available"""
    
    # Determine the field based on interests and goal
    field = determine_field(interests, goal)
    
    # Generate title
    title = f"{field} Career Roadmap"
    
    # Base template
    base_steps = [
        {
            "title": "Foundation Building",
            "description": f"Build a strong foundation in {field} with core concepts and fundamentals.",
            "resources": [
                f"Online courses in {field}",
                "YouTube tutorials and documentation",
                "Practice platforms (LeetCode, HackerRank)"
            ],
            "milestones": [
                "Understand core concepts",
                "Complete basic tutorials",
                "Build first simple project"
            ],
            "estimated_time": "1-2 months"
        },
        {
            "title": "Skill Development",
            "description": f"Develop practical skills in {field} through hands-on projects.",
            "resources": [
                "Project-based courses",
                "GitHub open source projects",
                "Developer communities"
            ],
            "milestones": [
                "Build 2-3 projects",
                "Join a community",
                "Start contributing to open source"
            ],
            "estimated_time": "2-3 months"
        },
        {
            "title": "Advanced Concepts",
            "description": f"Master advanced topics in {field} and specialized areas.",
            "resources": [
                "Advanced courses and certifications",
                "Technical books",
                "Expert blogs and podcasts"
            ],
            "milestones": [
                "Master advanced topics",
                "Build complex project",
                "Start mentoring others"
            ],
            "estimated_time": "2-3 months"
        },
        {
            "title": "Portfolio Building",
            "description": f"Create a strong portfolio showcasing your {field} skills.",
            "resources": [
                "Portfolio templates",
                "GitHub guides",
                "Personal branding resources"
            ],
            "milestones": [
                "Create professional portfolio",
                "Document projects",
                "Build online presence"
            ],
            "estimated_time": "1-2 months"
        },
        {
            "title": "Career Launch",
            "description": "Prepare for and start your career journey.",
            "resources": [
                "Interview preparation courses",
                "Resume and cover letter guides",
                "Networking tips"
            ],
            "milestones": [
                "Prepare resume",
                "Practice interviews",
                "Start job applications"
            ],
            "estimated_time": "1-2 months"
        }
    ]
    
    # Customize based on experience level
    if experience_level in ['intermediate', 'advanced', 'expert']:
        # Skip foundation for experienced users
        base_steps = base_steps[1:]
    
    # Add goal-specific steps
    if 'ai' in goal.lower() or 'machine learning' in goal.lower() or 'data science' in goal.lower():
        base_steps.insert(2, {
            "title": "AI/ML Specialization",
            "description": "Dive deep into AI and machine learning concepts.",
            "resources": [
                "ML courses (Coursera, Fast.ai)",
                "AI research papers",
                "Kaggle competitions"
            ],
            "milestones": [
                "Complete ML course",
                "Build ML project",
                "Participate in competition"
            ],
            "estimated_time": "3-4 months"
        })
    elif 'web' in goal.lower() or 'frontend' in goal.lower() or 'backend' in goal.lower():
        base_steps.insert(2, {
            "title": "Full Stack Development",
            "description": "Master full stack web development with modern frameworks.",
            "resources": [
                "React/Angular/Vue courses",
                "Node.js/Django/Spring Boot",
                "Database design guides"
            ],
            "milestones": [
                "Build full stack project",
                "Learn database design",
                "Deploy application"
            ],
            "estimated_time": "3-4 months"
        })
    
    # Limit to 7 steps
    steps = base_steps[:7]
    
    # Add specific skills to first step if available
    if skills:
        steps[0]['description'] += f" Focus on: {', '.join(skills[:3])}."
    
    return {
        "title": title,
        "description": f"A comprehensive roadmap to achieve your goal of {goal}.",
        "steps": steps
    }

def determine_field(interests: List[str], goal: str) -> str:
    """Determine the career field from interests and goal"""
    combined = ' '.join(interests + [goal]).lower()
    
    fields = {
        'Web Development': ['web', 'react', 'angular', 'vue', 'frontend', 'backend', 'fullstack', 'javascript'],
        'Data Science': ['data', 'analytics', 'statistics', 'python', 'sql', 'tableau', 'power bi'],
        'AI/Machine Learning': ['ai', 'machine learning', 'deep learning', 'neural network', 'nlp', 'computer vision'],
        'Mobile Development': ['mobile', 'android', 'ios', 'flutter', 'react native', 'swift'],
        'Cloud Computing': ['cloud', 'aws', 'azure', 'devops', 'kubernetes', 'docker', 'linux'],
        'Cybersecurity': ['security', 'cybersecurity', 'ethical hacking', 'penetration', 'security audit'],
        'Game Development': ['game', 'gaming', 'unity', 'unreal', '3d', 'c#', 'c++'],
        'UX/UI Design': ['ux', 'ui', 'design', 'figma', 'sketch', 'prototype'],
        'Project Management': ['project', 'management', 'agile', 'scrum', 'leadership']
    }
    
    for field, keywords in fields.items():
        for keyword in keywords:
            if keyword in combined:
                return field
    
    # Default
    return "Career"