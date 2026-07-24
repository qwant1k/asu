from django.db import migrations


DEFAULT_POSITIONS = [
    'Системный администратор',
    'Руководитель АХС',
    'Специалист АХС',
    'МОЛ по складу',
    'МОЛ по НМА',
    'Руководитель ФО',
    'Директор ДИТ',
    'Директор ЮД',
    'Директор ИРД',
    'Ведущий разработчик',
    'Бухгалтер',
    'Юрист',
    'Специалист СБ',
    'Член Рабочей комиссии',
    'Специалист ИРД',
]


def unique_code(model, prefix):
    index = model.objects.filter(code__startswith=f'{prefix}-').count() + 1
    while model.objects.filter(code=f'{prefix}-{index:04d}').exists():
        index += 1
    return f'{prefix}-{index:04d}'


def ensure_position(model, name):
    value = str(name or '').strip()
    if not value:
        return None
    position = model.objects.filter(name__iexact=value).first()
    if position:
        return position
    return model.objects.create(name=value, code=unique_code(model, 'POS'), is_active=True)


def forwards(apps, schema_editor):
    Position = apps.get_model('references', 'Position')
    User = apps.get_model('users', 'User')

    for name in DEFAULT_POSITIONS:
        ensure_position(Position, name)

    for user in User.objects.filter(position_ref__isnull=True).exclude(position=''):
        position = ensure_position(Position, user.position)
        if position:
            user.position_ref_id = position.id
            user.position = position.name
            user.save(update_fields=['position_ref', 'position'])


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0007_seed_unit_links'),
        ('users', '0004_user_position_ref'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
