from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('assets', '0009_allow_signed_inventory_adjustments'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='assetassignment',
            name='release_reason',
            field=models.TextField(blank=True, default='', verbose_name='Причина снятия закрепления'),
        ),
        migrations.AddField(
            model_name='assetassignment',
            name='released_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Снято с закрепления'),
        ),
        migrations.AddField(
            model_name='assetassignment',
            name='released_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='assignments_released', to=settings.AUTH_USER_MODEL, verbose_name='Снял с закрепления'),
        ),
        migrations.AlterField(
            model_name='assetassignment',
            name='status',
            field=models.CharField(choices=[('ACTIVE', 'Активно'), ('TRANSFERRED', 'Передано'), ('WRITTEN_OFF', 'Списано'), ('RELEASED', 'Снято с закрепления')], default='ACTIVE', max_length=20, verbose_name='Статус'),
        ),
        migrations.AlterField(
            model_name='stockmovement',
            name='movement_type',
            field=models.CharField(choices=[('RECEIPT', 'Оприходование'), ('ISSUE', 'Выдача'), ('TRANSFER', 'Перемещение'), ('WRITE_OFF', 'Списание'), ('INVENTORY_ADJUSTMENT', 'Корректировка по инвентаризации'), ('UNASSIGN', 'Снятие закрепления')], max_length=30, verbose_name='Тип операции'),
        ),
    ]
