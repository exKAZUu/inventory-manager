from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PartViewSet, SessionView, StockMovementViewSet, public_password

router = DefaultRouter(trailing_slash=False)
router.register("parts", PartViewSet, basename="part")
router.register("movements", StockMovementViewSet, basename="movement")

urlpatterns = [
    path("session", SessionView.as_view()),
    path("public-password", public_password),
    path("", include(router.urls)),
]
