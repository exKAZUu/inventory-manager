from rest_framework import serializers

from .models import Part, StockMovement


class PartSerializer(serializers.ModelSerializer):
    stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = Part
        fields = [
            "id",
            "name",
            "part_number",
            "unit_price",
            "manufacturer",
            "location",
            "min_stock",
            "note",
            "stock",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "stock"]


class StockMovementSerializer(serializers.ModelSerializer):
    part_name = serializers.CharField(source="part.name", read_only=True)
    part_number = serializers.CharField(source="part.part_number", read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            "id",
            "part",
            "part_name",
            "part_number",
            "type",
            "quantity",
            "reason",
            "occurred_at",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "part_name", "part_number"]
