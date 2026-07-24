from django.db import migrations


DEFAULT_UNITS = [
    'шт',
    'комплект',
    'упаковка',
    'кг',
    'л',
    'м',
    'м2',
    'м3',
    'рулон',
]


def unique_code(model, prefix):
    index = model.objects.filter(code__startswith=f'{prefix}-').count() + 1
    while model.objects.filter(code=f'{prefix}-{index:04d}').exists():
        index += 1
    return f'{prefix}-{index:04d}'


def ensure_unit(model, name):
    value = str(name or '').strip()
    if not value:
        return None
    unit = model.objects.filter(name__iexact=value).first()
    if unit:
        return unit
    return model.objects.create(name=value, code=unique_code(model, 'UOM'), is_active=True)


def forwards(apps, schema_editor):
    UnitOfMeasure = apps.get_model('references', 'UnitOfMeasure')
    Asset = apps.get_model('references', 'Asset')

    for name in DEFAULT_UNITS:
        ensure_unit(UnitOfMeasure, name)

    for asset in Asset.objects.filter(unit_of_measure_ref__isnull=True).exclude(unit_of_measure=''):
        unit = ensure_unit(UnitOfMeasure, asset.unit_of_measure)
        if unit:
            asset.unit_of_measure_ref_id = unit.id
            asset.unit_of_measure = unit.name
            asset.save(update_fields=['unit_of_measure_ref', 'unit_of_measure', 'updated_at'])


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0006_asset_unit_of_measure_ref'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
