"""Helpers for predictable reference codes."""

import re


ASSET_CODE_PREFIXES = {
    'TMZ': 'TMZ',
    'OS': 'OS',
    'NMA': 'NMA',
    'REPRESENTATIVE_TMZ': 'RTMZ',
}


def base_asset_type(asset_type):
    """Map specialised asset types to the dictionary type used by groups."""
    return 'TMZ' if asset_type == 'REPRESENTATIVE_TMZ' else asset_type


def code_prefix(asset_type, suffix=''):
    prefix = ASSET_CODE_PREFIXES.get(asset_type or '', asset_type or 'REF')
    return f'{prefix}-{suffix}' if suffix else prefix


def clean_code(value):
    value = (value or '').strip().upper()
    value = re.sub(r'[^A-Z0-9]+', '-', value)
    return re.sub(r'-+', '-', value).strip('-')


def next_code(model, prefix, exclude_pk=None):
    """Return the next PREFIX-0001-style code not used by model."""
    qs = model.objects.filter(code__startswith=f'{prefix}-')
    if exclude_pk:
        qs = qs.exclude(pk=exclude_pk)

    max_num = 0
    pattern = re.compile(rf'^{re.escape(prefix)}-(\d+)$')
    for code in qs.values_list('code', flat=True):
        match = pattern.match(code or '')
        if match:
            max_num = max(max_num, int(match.group(1)))

    return f'{prefix}-{max_num + 1:04d}'


def normalize_reference_code(model, raw_code, prefix, instance=None):
    """Normalize optional user-entered reference code.

    Empty code becomes the next sequential code, while short/manual numeric
    values such as "123" become "PREFIX-123".
    """
    cleaned = clean_code(raw_code)
    if not cleaned:
        return next_code(model, prefix, getattr(instance, 'pk', None))

    if cleaned.startswith(prefix):
        return cleaned

    if cleaned.isdigit() or len(cleaned) <= 4:
        return f'{prefix}-{cleaned}'

    return cleaned


def ensure_unique_code(model, code, instance=None):
    qs = model.objects.filter(code=code)
    if instance:
        qs = qs.exclude(pk=instance.pk)
    return not qs.exists()
