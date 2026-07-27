from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('common', '0002_numbersequence'),
        ('contenttypes', '0002_remove_content_type_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='TrashItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('object_id', models.CharField(max_length=255, verbose_name='ID объекта')),
                ('object_repr', models.CharField(max_length=255, verbose_name='Наименование')),
                ('model_label', models.CharField(max_length=255, verbose_name='Тип')),
                ('deleted_at', models.DateTimeField(auto_now_add=True, verbose_name='Удалено')),
                ('reason', models.TextField(blank=True, default='', verbose_name='Причина')),
                ('metadata', models.JSONField(blank=True, default=dict, verbose_name='Служебные данные')),
                ('content_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trash_items', to='contenttypes.contenttype', verbose_name='Тип объекта')),
                ('deleted_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='trash_items_created', to=settings.AUTH_USER_MODEL, verbose_name='Удалил')),
            ],
            options={
                'verbose_name': 'Удалённый объект',
                'verbose_name_plural': 'Удалённые объекты',
                'ordering': ['-deleted_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='trashitem',
            constraint=models.UniqueConstraint(fields=('content_type', 'object_id'), name='unique_trashed_object'),
        ),
    ]
