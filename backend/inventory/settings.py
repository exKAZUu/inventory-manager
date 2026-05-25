from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
REPO_DIR = BASE_DIR.parent

SECRET_KEY = os.environ.get("SESSION_SECRET", "dev-insecure-secret-change-me")
DEBUG = os.environ.get("DEBUG", "0") == "1"
ALLOWED_HOSTS = ["*"]
CSRF_TRUSTED_ORIGINS = [
    o.strip()
    for o in os.environ.get("CSRF_TRUSTED_ORIGINS", "").split(",")
    if o.strip()
]

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "django.contrib.sessions",
    "django.contrib.staticfiles",
    "rest_framework",
    "parts",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "inventory.urls"
WSGI_APPLICATION = "inventory.wsgi.application"

FRONTEND_DIST = REPO_DIR / "frontend" / "dist"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [FRONTEND_DIST],
        "APP_DIRS": False,
        "OPTIONS": {"context_processors": []},
    },
]

DB_PATH = os.environ.get("DATABASE_PATH", str(BASE_DIR / "dev.sqlite3"))
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": DB_PATH,
    }
}

LANGUAGE_CODE = "ja"
TIME_ZONE = "Asia/Tokyo"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/assets/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [FRONTEND_DIST / "assets"] if (FRONTEND_DIST / "assets").exists() else []
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
WHITENOISE_MANIFEST_STRICT = False

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

SESSION_COOKIE_NAME = "inv_session"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE", "0") == "1"
SESSION_ENGINE = "django.contrib.sessions.backends.signed_cookies"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "parts.permissions.IsLoggedIn",
    ],
    "UNAUTHENTICATED_USER": None,
}

APP_PASSWORD = os.environ.get("APP_PASSWORD", "changeme")
