from rest_framework.permissions import BasePermission


class IsLoggedIn(BasePermission):
    def has_permission(self, request, view) -> bool:
        if getattr(view, "allow_anonymous", False):
            return True
        return bool(request.session.get("authed"))
