from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('common', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='NumberSequence',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                (
                    'scope',
                    models.CharField(max_length=100, verbose_name='Область нумерации'),
                ),
                (
                    'year',
                    models.PositiveSmallIntegerField(verbose_name='Год'),
                ),
                (
                    'value',
                    models.PositiveIntegerField(default=0, verbose_name='Текущее значение'),
                ),
                (
                    'updated_at',
                    models.DateTimeField(auto_now=True, verbose_name='Обновлено'),
                ),
            ],
            options={
                'verbose_name': 'Счётчик номеров',
                'verbose_name_plural': 'Счётчики номеров',
            },
        ),
        migrations.AddConstraint(
            model_name='numbersequence',
            constraint=models.UniqueConstraint(
                fields=('scope', 'year'),
                name='unique_number_sequence_scope_year',
            ),
        ),
    ]
