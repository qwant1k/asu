"""Concurrency-safe generation of human-readable business numbers."""

from django.db import transaction

from apps.common.models import NumberSequence


@transaction.atomic
def next_number(scope: str, year: int, *, width: int = 3) -> str:
    """Return the next ``NNN/YYYY`` value for a logical numbering scope."""

    sequence, _ = NumberSequence.objects.select_for_update().get_or_create(
        scope=scope,
        year=year,
        defaults={'value': 0},
    )
    sequence.value += 1
    sequence.save(update_fields=['value', 'updated_at'])
    return f'{sequence.value:0{width}d}/{year}'
