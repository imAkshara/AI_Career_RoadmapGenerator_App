import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env (local development)
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ============ SECURITY ============
# Use environment variable for SECRET_KEY, fallback for local dev
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-)cgr-2*(y7&_ut4pl0-j785$n+t8gf**zpak@y=+@1lgnbjbxo')

# DEBUG – set to False in production
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# ALLOWED_HOSTS – allow all for Railway (restrict later)
ALLOWED_HOSTS = ['*']   # or use os.environ.get('ALLOWED_HOSTS', '').split(',')

# ============ APPLICATION DEFINITION ============
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
    
    # Local apps
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at the top!
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # NEW: for static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',   # Keep for production (you can comment out locally)
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# ============ DATABASE ============
# Use PostgreSQL on Railway (via DATABASE_URL), fallback to SQLite locally
import dj_database_url
DATABASES = {
    'default': dj_database_url.config(default='sqlite:///db.sqlite3')
}

# ============ PASSWORD VALIDATION ============
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ============ INTERNATIONALIZATION ============
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ============ STATIC FILES ============
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'          # Where collectstatic will put files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ============ DEFAULT PRIMARY KEY ============
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ============ CORS SETTINGS ============
# Allow all origins during development (your React frontend on Railway later)
CORS_ALLOW_ALL_ORIGINS = True   # For production, set specific allowed origins
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept', 'accept-encoding', 'authorization', 'content-type',
    'dnt', 'origin', 'user-agent', 'x-csrftoken', 'x-requested-with',
]

# ============ REST FRAMEWORK ============
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',   # Adjust as needed
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# ============ OPENAI API KEY ============
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')