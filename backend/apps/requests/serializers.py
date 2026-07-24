"""Сериализаторы заявок ИС «АСУ»."""

from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from apps.references.codegen import base_asset_type

from .models import AssetRequest, AssetRequestItem, RequestApproval
from .services import RequestWorkflowService


class PendingMyApprovalMixin(serializers.Serializer):
    """Добавляет вычисляемый признак: ожидает согласования текущим пользователем."""

    pending_my_approval = serializers.SerializerMethodField()
    pending_my_issue = serializers.SerializerMethodField()
    required_approver_role = serializers.SerializerMethodField()

    def get_pending_my_approval(self, obj):
        request = self.context.get('request')
        if not request or not getattr(request.user, 'is_authenticated', False):
            return False
        return RequestWorkflowService.can_approve(obj, request.user)

    def get_pending_my_issue(self, obj):
        request = self.context.get('request')
        if not request or not getattr(request.user, 'is_authenticated', False):
            return False
        return RequestWorkflowService.can_issue(obj, request.user)

    def get_required_approver_role(self, obj):
        return RequestWorkflowService.get_required_approver_role(obj)


class AssetRequestItemSerializer(serializers.ModelSerializer):
    """Сериализатор позиции заявки."""

    requested_group_name = serializers.CharField(source='requested_group.name', read_only=True, default='')
    asset_name = serializers.SerializerMethodField()
    asset_code = serializers.SerializerMethodField()
    unit_of_measure = serializers.SerializerMethodField()
    unit_price = serializers.SerializerMethodField()
    issued_asset_name = serializers.CharField(source='issued_asset.name', read_only=True, default='')
    issued_asset_code = serializers.CharField(source='issued_asset.code', read_only=True, default='')

    class Meta:
        model = AssetRequestItem
        fields = [
            'id', 'requested_group', 'requested_group_name',
            'asset', 'asset_name', 'asset_code',
            'issued_asset', 'issued_asset_name', 'issued_asset_code',
            'unit_of_measure', 'unit_price',
            'quantity_requested', 'quantity_issued', 'comment',
        ]
        read_only_fields = ['quantity_issued']

    def get_asset_name(self, obj):
        asset = obj.issued_asset or obj.asset
        return asset.name if asset else ''

    def get_asset_code(self, obj):
        asset = obj.issued_asset or obj.asset
        return asset.code if asset else ''

    def get_unit_of_measure(self, obj):
        asset = obj.issued_asset or obj.asset
        return asset.unit_of_measure if asset else ''

    def get_unit_price(self, obj):
        asset = obj.issued_asset or obj.asset
        return asset.unit_price if asset else None

    def validate(self, attrs):
        requested_group = attrs.get('requested_group') or getattr(self.instance, 'requested_group', None)
        asset = attrs.get('asset') if 'asset' in attrs else getattr(self.instance, 'asset', None)
        issued_asset = attrs.get('issued_asset') if 'issued_asset' in attrs else getattr(self.instance, 'issued_asset', None)

        if not requested_group and not asset:
            raise serializers.ValidationError({'requested_group': 'Необходимо указать группу для заявки.'})

        if requested_group and issued_asset and issued_asset.group_id != requested_group.id:
            raise serializers.ValidationError({'issued_asset': 'Выданный актив должен принадлежать выбранной группе.'})

        return attrs


class RequestApprovalSerializer(serializers.ModelSerializer):
    """Сериализатор записи согласования."""

    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = RequestApproval
        fields = [
            'id', 'approver', 'approver_name', 'role_at_approval',
            'action', 'action_display', 'signed_at', 'comment', 'created_at',
        ]


class AssetRequestListSerializer(PendingMyApprovalMixin, serializers.ModelSerializer):
    """Сериализатор списка заявок (краткий)."""

    initiator_name = serializers.CharField(source='initiator.get_full_name', read_only=True)
    request_type_name = serializers.CharField(source='request_type.name', read_only=True)
    request_type_asset_type = serializers.CharField(source='request_type.asset_type', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    issue_responsibles = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    issue_responsible_names = serializers.SerializerMethodField()
    deletion_requested = serializers.SerializerMethodField()
    deletion_requested_by_name = serializers.SerializerMethodField()

    def get_issue_responsible_names(self, obj):
        return [
            user.get_short_name() or user.username
            for user in obj.issue_responsibles.all()
        ]

    def get_deletion_requested(self, obj):
        return bool(obj.deletion_requested_at)

    def get_deletion_requested_by_name(self, obj):
        user = obj.deletion_requested_by
        if not user:
            return ''
        return user.get_full_name() or user.username

    class Meta:
        model = AssetRequest
        fields = [
            'id', 'number', 'request_type', 'request_type_name', 'request_type_asset_type',
            'status', 'status_display', 'initiator', 'initiator_name',
            'pending_my_approval', 'pending_my_issue', 'required_approver_role',
            'issue_responsibles', 'issue_responsible_names', 'created_at', 'updated_at',
            'deletion_requested', 'deletion_requested_by', 'deletion_requested_by_name', 'deletion_requested_at',
        ]


class AssetRequestDetailSerializer(PendingMyApprovalMixin, serializers.ModelSerializer):
    """Сериализатор детальной карточки заявки."""

    items = AssetRequestItemSerializer(many=True, read_only=True)
    approvals = RequestApprovalSerializer(many=True, read_only=True)
    initiator_name = serializers.CharField(source='initiator.get_full_name', read_only=True)
    request_type_name = serializers.CharField(source='request_type.name', read_only=True)
    request_type_asset_type = serializers.CharField(source='request_type.asset_type', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    from_user_name = serializers.CharField(
        source='from_user.get_full_name', read_only=True, default='',
    )
    to_user_name = serializers.CharField(
        source='to_user.get_full_name', read_only=True, default='',
    )
    issue_responsibles = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    issue_responsible_names = serializers.SerializerMethodField()
    deletion_requested = serializers.SerializerMethodField()
    deletion_requested_by_name = serializers.SerializerMethodField()

    def get_issue_responsible_names(self, obj):
        return [
            user.get_short_name() or user.username
            for user in obj.issue_responsibles.all()
        ]

    def get_deletion_requested(self, obj):
        return bool(obj.deletion_requested_at)

    def get_deletion_requested_by_name(self, obj):
        user = obj.deletion_requested_by
        if not user:
            return ''
        return user.get_full_name() or user.username

    class Meta:
        model = AssetRequest
        fields = [
            'id', 'number', 'request_type', 'request_type_name', 'request_type_asset_type',
            'status', 'status_display',
            'initiator', 'initiator_name',
            'from_user', 'from_user_name',
            'to_user', 'to_user_name',
            'reason', 'items', 'approvals',
            'issue_responsibles', 'issue_responsible_names',
            'pending_my_approval', 'pending_my_issue', 'required_approver_role',
            'created_at', 'updated_at',
            'deletion_requested', 'deletion_requested_by', 'deletion_requested_by_name', 'deletion_requested_at',
        ]


class AssetRequestCreateSerializer(serializers.ModelSerializer):
    """Сериализатор создания заявки."""

    items = AssetRequestItemSerializer(many=True)
    client_created_at = serializers.DateTimeField(write_only=True, required=False)

    class Meta:
        model = AssetRequest
        fields = [
            'id', 'request_type', 'from_user', 'to_user',
            'reason', 'items', 'client_created_at',
        ]

    def validate(self, attrs):
        request_type = attrs.get('request_type') or (self.instance and self.instance.request_type)
        items = attrs.get('items')
        if not request_type or items is None:
            return attrs

        expected_type = base_asset_type(request_type.asset_type)
        for idx, item in enumerate(items, start=1):
            group = item.get('requested_group')
            asset = item.get('asset')
            if not group and not asset:
                raise serializers.ValidationError({
                    'items': _(f'Строка {idx}: необходимо указать группу или конкретную позицию.'),
                })
            if group and group.asset_type != expected_type:
                raise serializers.ValidationError({
                    'items': _(f'Строка {idx}: группа не соответствует типу заявки.'),
                })
            if asset and base_asset_type(asset.asset_type) != expected_type:
                raise serializers.ValidationError({
                    'items': _(f'Строка {idx}: позиция не соответствует типу заявки.'),
                })
            if group and asset and asset.group_id and asset.group_id != group.id:
                raise serializers.ValidationError({
                    'items': _(f'Строка {idx}: позиция не входит в выбранную группу.'),
                })

        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        client_created_at = validated_data.pop('client_created_at', None)
        request_obj = AssetRequest.objects.create(**validated_data)
        if client_created_at:
            request_obj.created_at = client_created_at
            request_obj.save(update_fields=['created_at'])
        for item_data in items_data:
            AssetRequestItem.objects.create(request=request_obj, **item_data)
        return request_obj

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        validated_data.pop('client_created_at', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                AssetRequestItem.objects.create(request=instance, **item_data)

        return instance
