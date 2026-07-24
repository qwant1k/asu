from django.db import migrations


DEFAULT_WAREHOUSES = [
    'Основной склад',
    'Склад ТМЗ',
    'Склад ОС',
    'Склад НМА',
    'Серверное хранилище',
]


def unique_code(model, prefix):
    index = model.objects.filter(code__startswith=f'{prefix}-').count() + 1
    while model.objects.filter(code=f'{prefix}-{index:04d}').exists():
        index += 1
    return f'{prefix}-{index:04d}'


def ensure_warehouse(model, name):
    value = str(name or '').strip()
    if not value:
        return None
    warehouse = model.objects.filter(name__iexact=value).first()
    if warehouse:
        return warehouse
    return model.objects.create(name=value, code=unique_code(model, 'WH'), is_active=True)


def forwards(apps, schema_editor):
    Warehouse = apps.get_model('references', 'Warehouse')
    WarehouseStock = apps.get_model('assets', 'WarehouseStock')
    AssetAssignment = apps.get_model('assets', 'AssetAssignment')
    StockMovement = apps.get_model('assets', 'StockMovement')

    for name in DEFAULT_WAREHOUSES:
        ensure_warehouse(Warehouse, name)
    default_warehouse = ensure_warehouse(Warehouse, DEFAULT_WAREHOUSES[0])

    for stock in WarehouseStock.objects.filter(warehouse__isnull=True):
        warehouse = ensure_warehouse(Warehouse, stock.location) if stock.location else default_warehouse
        if warehouse:
            stock.warehouse_id = warehouse.id
            stock.location = warehouse.name
            stock.save(update_fields=['warehouse', 'location', 'updated_at'])

    stock_warehouses = {
        stock.asset_id: stock.warehouse_id
        for stock in WarehouseStock.objects.exclude(warehouse__isnull=True)
    }

    for assignment in AssetAssignment.objects.filter(warehouse__isnull=True):
        warehouse = ensure_warehouse(Warehouse, assignment.location) if assignment.location else None
        if not warehouse and assignment.asset_id in stock_warehouses:
            warehouse = Warehouse.objects.filter(pk=stock_warehouses[assignment.asset_id]).first()
        if not warehouse:
            warehouse = default_warehouse
        if warehouse:
            assignment.warehouse_id = warehouse.id
            if not assignment.location:
                assignment.location = warehouse.name
            assignment.save(update_fields=['warehouse', 'location'])

    for movement in StockMovement.objects.filter(warehouse__isnull=True):
        warehouse_id = stock_warehouses.get(movement.asset_id)
        if warehouse_id:
            movement.warehouse_id = warehouse_id
            movement.save(update_fields=['warehouse'])


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0007_seed_unit_links'),
        ('assets', '0005_assetassignment_warehouse_stockmovement_warehouse_and_more'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
