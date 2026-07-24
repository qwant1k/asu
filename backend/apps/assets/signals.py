"""Signals for stock alert evaluation."""

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import WarehouseStock
from .services import StockAlertService


@receiver(post_save, sender=WarehouseStock)
def evaluate_stock_alerts(sender, instance, **kwargs):
    StockAlertService.evaluate_stock(instance)
