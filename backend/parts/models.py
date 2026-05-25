from django.db import models


class Part(models.Model):
    name = models.CharField(max_length=200)
    part_number = models.CharField(max_length=200, unique=True)
    unit_price = models.IntegerField(default=0)
    manufacturer = models.CharField(max_length=200, blank=True, default="")
    location = models.CharField(max_length=200, blank=True, default="")
    min_stock = models.IntegerField(default=0)
    note = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["part_number"]

    def __str__(self) -> str:
        return f"{self.name} ({self.part_number})"


class StockMovement(models.Model):
    IN = "IN"
    OUT = "OUT"
    TYPE_CHOICES = [(IN, "入庫"), (OUT, "出庫")]

    part = models.ForeignKey(Part, on_delete=models.CASCADE, related_name="movements")
    type = models.CharField(max_length=3, choices=TYPE_CHOICES)
    quantity = models.PositiveIntegerField()
    reason = models.TextField(blank=True, default="")
    occurred_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-occurred_at", "-id"]
        indexes = [
            models.Index(fields=["part", "-occurred_at"]),
            models.Index(fields=["-occurred_at"]),
        ]
