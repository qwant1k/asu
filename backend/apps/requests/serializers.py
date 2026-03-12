"""Сериализаторы заявок ИС «АСУ»."""

from rest_framework import serializers

from .models import AssetRequest, AssetRequestItem, RequestApproval


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


class AssetRequestListSerializer(serializers.ModelSerializer):
    """Сериализатор списка заявок (краткий)."""

    initiator_name = serializers.CharField(source='initiator.get_full_name', read_only=True)
    request_type_name = serializers.CharField(source='request_type.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AssetRequest
        fields = [
            'id', 'number', 'request_type', 'request_type_name',
            'status', 'status_display', 'initiator', 'initiator_name',
            'created_at', 'updated_at',
        ]


class AssetRequestDetailSerializer(serializers.ModelSerializer):
    """Сериализатор детальной карточки заявки."""

    items = AssetRequestItemSerializer(many=True, read_only=True)
    approvals = RequestApprovalSerializer(many=True, read_only=True)
    initiator_name = serializers.CharField(source='initiator.get_full_name', read_only=True)
    request_type_name = serializers.CharField(source='request_type.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    from_user_name = serializers.CharField(
        source='from_user.get_full_name', read_only=True, default='',
    )
    to_user_name = serializers.CharField(
        source='to_user.get_full_name', read_only=True, default='',
    )

    class Meta:
        model = AssetRequest
        fields = [
            'id', 'number', 'request_type', 'request_type_name',
            'status', 'status_display',
            'initiator', 'initiator_name',
            'from_user', 'from_user_name',
            'to_user', 'to_user_name',
            'reason', 'items', 'approvals',
            'created_at', 'updated_at',
        ]


class AssetRequestCreateSerializer(serializers.ModelSerializer):
    """Сериализатор создания заявки."""

    items = AssetRequestItemSerializer(many=True)

    class Meta:
        model = AssetRequest
        fields = [
            'id', 'request_type', 'from_user', 'to_user',
            'reason', 'items',
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        request_obj = AssetRequest.objects.create(**validated_data)
        for item_data in items_data:
            AssetRequestItem.objects.create(request=request_obj, **item_data)
        return request_obj

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                AssetRequestItem.objects.create(request=instance, **item_data)

        return instance
