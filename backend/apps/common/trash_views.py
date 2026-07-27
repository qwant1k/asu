from django.db.models.deletion import ProtectedError
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from apps.common.models import TrashItem
from apps.common.trash import restore_from_trash
from apps.users.access import has_access


class IsSystemAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and has_access(request.user, 'system.admin')
        )


class TrashItemSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    deleted_by_name = serializers.SerializerMethodField()
    app_label = serializers.CharField(source='content_type.app_label', read_only=True)
    model = serializers.CharField(source='content_type.model', read_only=True)
    recoverable = serializers.SerializerMethodField()

    class Meta:
        model = TrashItem
        fields = [
            'id', 'status', 'app_label', 'model', 'model_label', 'object_id',
            'object_repr', 'deleted_by', 'deleted_by_name', 'deleted_at',
            'reason', 'recoverable',
        ]

    def get_deleted_by_name(self, obj):
        if not obj.deleted_by:
            return ''
        return obj.deleted_by.get_full_name() or obj.deleted_by.username

    def get_status(self, obj):
        return 'DELETED'

    def get_recoverable(self, obj):
        return obj.content_object is not None


class TrashItemViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsSystemAdmin]
    serializer_class = TrashItemSerializer
    queryset = TrashItem.objects.select_related('content_type', 'deleted_by')
    search_fields = ['object_repr', 'model_label', 'object_id', 'deleted_by__username']
    filterset_fields = ['content_type__app_label', 'content_type__model']
    ordering_fields = ['deleted_at', 'model_label', 'object_repr']

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        item = self.get_object()
        instance = restore_from_trash(item)
        return Response({
            'detail': 'Объект восстановлен.',
            'object_id': str(instance.pk),
        })

    @action(detail=True, methods=['delete'], url_path='purge')
    def purge(self, request, pk=None):
        item = self.get_object()
        instance = item.content_object
        try:
            if instance is not None:
                instance.delete()
            item.delete()
        except ProtectedError:
            return Response(
                {'detail': 'Окончательное удаление невозможно: объект используется другими данными.'},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)
