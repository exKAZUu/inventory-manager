from django.conf import settings
from django.db.models import (
    Case,
    F,
    IntegerField,
    Q,
    Sum,
    Value,
    When,
)
from django.middleware.csrf import get_token
from django.utils.dateparse import parse_date, parse_datetime
from django.utils.timezone import make_aware, now
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Part, StockMovement
from .serializers import PartSerializer, StockMovementSerializer


def _annotate_stock(qs):
    return qs.annotate(
        stock=Sum(
            Case(
                When(movements__type="IN", then=F("movements__quantity")),
                When(movements__type="OUT", then=-F("movements__quantity")),
                default=Value(0),
                output_field=IntegerField(),
            )
        )
    )


class SessionView(APIView):
    allow_anonymous = True
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "authed": bool(request.session.get("authed")),
                "csrf_token": get_token(request),
            }
        )

    def post(self, request):
        password = request.data.get("password") or ""
        if password != settings.APP_PASSWORD:
            return Response(
                {"detail": "パスワードが違います"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        request.session["authed"] = True
        request.session.set_expiry(60 * 60 * 24 * 30)
        return Response({"authed": True, "csrf_token": get_token(request)})

    def delete(self, request):
        request.session.flush()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([AllowAny])
def public_password(request):
    """サンプル用途のためログイン画面で表示するパスワード。"""
    return Response({"password": settings.APP_PASSWORD})


class PartViewSet(viewsets.ModelViewSet):
    serializer_class = PartSerializer

    def get_queryset(self):
        qs = Part.objects.all()
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(part_number__icontains=q))
        return _annotate_stock(qs).order_by("part_number")

    @action(detail=True, methods=["get"])
    def movements(self, request, pk=None):
        movements = StockMovement.objects.filter(part_id=pk).order_by(
            "-occurred_at", "-id"
        )[:200]
        return Response(StockMovementSerializer(movements, many=True).data)


class StockMovementViewSet(viewsets.ModelViewSet):
    serializer_class = StockMovementSerializer
    queryset = StockMovement.objects.select_related("part").all()

    def get_queryset(self):
        qs = StockMovement.objects.select_related("part").all()
        p = self.request.query_params
        if p.get("part"):
            qs = qs.filter(part_id=p["part"])
        if p.get("type") in ("IN", "OUT"):
            qs = qs.filter(type=p["type"])
        if p.get("from"):
            d = parse_date(p["from"])
            if d:
                qs = qs.filter(occurred_at__date__gte=d)
        if p.get("to"):
            d = parse_date(p["to"])
            if d:
                qs = qs.filter(occurred_at__date__lte=d)
        return qs.order_by("-occurred_at", "-id")[:500]

    def create(self, request, *args, **kwargs):
        data = dict(request.data)
        # occurred_at 未指定なら現在時刻
        occurred = data.get("occurred_at")
        if not occurred:
            data["occurred_at"] = now().isoformat()
        elif isinstance(occurred, str):
            dt = parse_datetime(occurred)
            if dt and dt.tzinfo is None:
                data["occurred_at"] = make_aware(dt).isoformat()
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
