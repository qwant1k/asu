from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.db.models import UniqueConstraint
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.common.models import TrashItem


def exclude_trashed(queryset):
    """Исключить объекты, зарегистрированные в корзине."""
    content_type = ContentType.objects.get_for_model(queryset.model)
    # Materialize the generic string identifiers so Django prepares them
    # according to the concrete model PK type. A SQL subquery would compare
    # bigint/UUID columns with varchar on PostgreSQL.
    object_ids = list(
        TrashItem.objects.filter(
            content_type=content_type,
        ).values_list('object_id', flat=True)
    )
    return queryset.exclude(pk__in=object_ids)


@transaction.atomic
def move_to_trash(instance, user, reason=''):
    """Скрыть объект, сохранив его в исходной таблице для восстановления."""
    if instance._meta.label_lower == 'users.user' and instance.pk == user.pk:
        raise ValidationError({'detail': 'Нельзя удалить собственную учетную запись.'})

    content_type = ContentType.objects.get_for_model(instance)
    metadata = {}
    field_names = {
        field.name
        for field in instance._meta.concrete_fields
    }
    if 'is_active' in field_names:
        metadata['was_active'] = bool(instance.is_active)
        if instance.is_active:
            instance.is_active = False
            instance.save(update_fields=['is_active'])

    item, created = TrashItem.objects.get_or_create(
        content_type=content_type,
        object_id=str(instance.pk),
        defaults={
            'object_repr': str(instance)[:255],
            'model_label': str(instance._meta.verbose_name),
            'deleted_by': user,
            'reason': (reason or '').strip(),
            'metadata': metadata,
        },
    )
    if not created:
        raise ValidationError({'detail': 'Объект уже находится в корзине.'})
    if instance._meta.label_lower in {
        'users.user',
        'users.positionaccessrule',
        'users.useraccessoverride',
    }:
        from apps.users.access import clear_access_cache
        transaction.on_commit(clear_access_cache)
    return item


@transaction.atomic
def restore_from_trash(item):
    instance = item.content_object
    if instance is None:
        raise ValidationError({'detail': 'Исходный объект уже отсутствует в базе данных.'})
    field_names = {
        field.name
        for field in instance._meta.concrete_fields
    }
    if 'is_active' in field_names and item.metadata.get('was_active'):
        instance.is_active = True
        instance.save(update_fields=['is_active'])
    if instance._meta.label_lower in {
        'users.user',
        'users.positionaccessrule',
        'users.useraccessoverride',
    }:
        from apps.users.access import clear_access_cache
        transaction.on_commit(clear_access_cache)
    item.delete()
    return instance


class SoftDeleteViewSetMixin:
    """Скрытие удалённых объектов и перенос DELETE в корзину."""

    def _find_trashed_unique_match(self, request):
        """Find a trashed row that owns a unique identity from create payload."""
        queryset = getattr(self, 'queryset', None)
        model = getattr(queryset, 'model', None)
        if model is None:
            model = getattr(getattr(self.get_serializer_class(), 'Meta', None), 'model', None)
        if model is None:
            return None
        content_type = ContentType.objects.get_for_model(model)
        trashed_ids = list(
            TrashItem.objects.filter(
                content_type=content_type,
            ).values_list('object_id', flat=True)
        )
        if not trashed_ids:
            return None
        candidates = model._default_manager.filter(pk__in=trashed_ids)

        unique_sets = [
            (field.name,)
            for field in model._meta.concrete_fields
            if field.unique and not field.primary_key
        ]
        unique_sets.extend(
            constraint.fields
            for constraint in model._meta.constraints
            if isinstance(constraint, UniqueConstraint) and constraint.fields
        )

        for field_names in unique_sets:
            values = {}
            for field_name in field_names:
                if field_name == 'normalized_position' and 'position' in request.data:
                    from apps.users.access import normalize_position
                    value = normalize_position(request.data.get('position'))
                elif field_name in request.data:
                    value = request.data.get(field_name)
                else:
                    values = {}
                    break
                if value in (None, ''):
                    values = {}
                    break
                values[field_name] = value
            if not values:
                continue
            instance = candidates.filter(**values).first()
            if instance is not None:
                return TrashItem.objects.filter(
                    content_type=content_type,
                    object_id=str(instance.pk),
                ).first()
        return None

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # Re-creating the same unique dictionary/access entry restores it
        # instead of failing against the row intentionally kept in the trash.
        item = self._find_trashed_unique_match(request)
        if item is None:
            return super().create(request, *args, **kwargs)

        instance = restore_from_trash(item)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        return exclude_trashed(super().get_queryset())

    def filter_queryset(self, queryset):
        return super().filter_queryset(exclude_trashed(queryset))

    def perform_destroy(self, instance):
        move_to_trash(
            instance,
            self.request.user,
            self.request.data.get('reason', ''),
        )
