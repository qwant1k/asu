from decimal import Decimal

from django.db import migrations, models
import django.db.models.deletion


def populate_stock_price(apps, schema_editor):
    WarehouseStock = apps.get_model('assets', 'WarehouseStock')
    for stock in WarehouseStock.objects.select_related('asset').all().iterator():
        stock.unit_price = (
            stock.total_amount / stock.quantity
            if stock.quantity
            else stock.asset.unit_price or Decimal('0')
        )
        stock.save(update_fields=['unit_price'])


class Migration(migrations.Migration):
    dependencies = [
        ('assets', '0007_stockalertrule_stockalertstate_and_more'),
        ('references', '0008_contract'),
    ]

    operations = [
        migrations.AlterField(
            model_name='warehousestock',
            name='asset',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='warehouse_stocks', to='references.asset', verbose_name='Актив'),
        ),
        migrations.AddField(
            model_name='warehousestock',
            name='unit_price',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=15, verbose_name='Учётная цена за единицу'),
        ),
        migrations.RunPython(populate_stock_price, migrations.RunPython.noop),
        migrations.AddConstraint(model_name='warehousestock', constraint=models.UniqueConstraint(fields=('asset', 'warehouse'), name='unique_asset_warehouse_stock')),
        migrations.AddConstraint(model_name='warehousestock', constraint=models.UniqueConstraint(condition=models.Q(('warehouse__isnull', True)), fields=('asset',), name='unique_asset_stock_without_warehouse')),
        migrations.AddConstraint(model_name='warehousestock', constraint=models.CheckConstraint(check=models.Q(('quantity__gte', 0)), name='warehouse_stock_quantity_nonnegative')),
        migrations.AddConstraint(model_name='warehousestock', constraint=models.CheckConstraint(check=models.Q(('total_amount__gte', 0)), name='warehouse_stock_total_nonnegative')),
        migrations.AddConstraint(model_name='assetassignment', constraint=models.CheckConstraint(check=models.Q(('quantity__gt', 0)), name='asset_assignment_quantity_positive')),
        migrations.AddConstraint(model_name='stockmovement', constraint=models.CheckConstraint(check=models.Q(('quantity__gt', 0)), name='stock_movement_quantity_positive')),
        migrations.AddConstraint(model_name='stockmovement', constraint=models.CheckConstraint(check=models.Q(('unit_price__gte', 0)), name='stock_movement_price_nonnegative')),
    ]
