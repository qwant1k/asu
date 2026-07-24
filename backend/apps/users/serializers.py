from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from apps.references.models import Position

from .access import ACCESS_DEFINITIONS, effective_access_codes
from .models import Department, PositionAccessRule, User, UserAccessOverride


def sync_position_from_reference(validated_data):
    if 'position_ref' in validated_data:
        position_ref = validated_data.get('position_ref')
        validated_data['position'] = position_ref.name if position_ref else ''
    elif 'position' in validated_data and validated_data.get('position'):
        position_name = validated_data.get('position', '').strip()
        position_ref = Position.objects.filter(name__iexact=position_name).first()
        if position_ref:
            validated_data['position_ref'] = position_ref
            validated_data['position'] = position_ref.name
    return validated_data


class DepartmentSerializer(serializers.ModelSerializer):
    """Department serializer."""

    head_name = serializers.CharField(source='head.get_short_name', read_only=True, default='')
    parent_name = serializers.CharField(source='parent.name', read_only=True, default='')

    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'head', 'head_name', 'parent', 'parent_name']


class UserSerializer(serializers.ModelSerializer):
    """Full user serializer."""

    full_name = serializers.CharField(source='get_full_name', read_only=True)
    short_name = serializers.CharField(source='get_short_name', read_only=True)
    photo = serializers.ImageField(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True, default='')
    position_ref_name = serializers.CharField(source='position_ref.name', read_only=True, default='')
    supervisor_name = serializers.CharField(source='supervisor.get_short_name', read_only=True, default='')
    effective_permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'photo',
            'first_name',
            'last_name',
            'patronymic',
            'position',
            'position_ref',
            'position_ref_name',
            'department',
            'department_name',
            'phone',
            'role',
            'supervisor',
            'supervisor_name',
            'is_active',
            'is_staff',
            'is_superuser',
            'date_joined',
            'last_login',
            'full_name',
            'short_name',
            'effective_permissions',
        ]
        read_only_fields = ['date_joined', 'last_login', 'is_superuser']

    def validate_supervisor(self, value):
        if self.instance and value and value.id == self.instance.id:
            raise serializers.ValidationError(_('Пользователь не может быть своим руководителем.'))
        return value

    def update(self, instance, validated_data):
        return super().update(instance, sync_position_from_reference(validated_data))

    def get_effective_permissions(self, obj):
        return sorted(effective_access_codes(obj))


class UserCreateSerializer(serializers.ModelSerializer):
    """User creation serializer."""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'photo',
            'password',
            'first_name',
            'last_name',
            'patronymic',
            'position',
            'position_ref',
            'department',
            'phone',
            'role',
            'supervisor',
            'is_active',
            'is_staff',
        ]

    def create(self, validated_data):
        validated_data = sync_position_from_reference(validated_data)
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def validate_supervisor(self, value):
        if value and self.initial_data.get('username') == value.username:
            raise serializers.ValidationError(_('Пользователь не может быть своим руководителем.'))
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    """Current user profile serializer."""

    full_name = serializers.CharField(source='get_full_name', read_only=True)
    short_name = serializers.CharField(source='get_short_name', read_only=True)
    photo = serializers.ImageField(required=False, allow_null=True)
    remove_photo = serializers.BooleanField(write_only=True, required=False, default=False)
    department_name = serializers.CharField(source='department.name', read_only=True, default='')
    position_ref_name = serializers.CharField(source='position_ref.name', read_only=True, default='')
    supervisor_name = serializers.CharField(source='supervisor.get_short_name', read_only=True, default='')
    effective_permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'photo',
            'remove_photo',
            'first_name',
            'last_name',
            'patronymic',
            'position',
            'position_ref',
            'position_ref_name',
            'department',
            'department_name',
            'phone',
            'role',
            'supervisor',
            'supervisor_name',
            'is_active',
            'full_name',
            'short_name',
            'date_joined',
            'last_login',
            'effective_permissions',
        ]
        read_only_fields = ['id', 'username', 'role', 'date_joined', 'last_login', 'supervisor']

    def get_effective_permissions(self, obj):
        return sorted(effective_access_codes(obj))

    def update(self, instance, validated_data):
        remove_photo = validated_data.pop('remove_photo', False)
        if remove_photo and instance.photo:
            instance.photo.delete(save=False)
            instance.photo = None
        return super().update(instance, sync_position_from_reference(validated_data))


class DepartmentTreeSerializer(serializers.ModelSerializer):
    """Recursive department tree serializer."""

    children = serializers.SerializerMethodField()
    head_name = serializers.CharField(source='head.get_short_name', read_only=True, default='')

    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'head', 'head_name', 'children']

    def get_children(self, obj):
        children = obj.children.select_related('head').all()
        return DepartmentTreeSerializer(children, many=True).data


class LoginSerializer(serializers.Serializer):
    """Login serializer."""

    username = serializers.CharField(label=_('Имя пользователя'))
    password = serializers.CharField(label=_('Пароль'), write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        user = authenticate(
            request=self.context.get('request'),
            username=username,
            password=password,
        )

        if not user:
            raise serializers.ValidationError(
                _('Неверное имя пользователя или пароль'),
                code='authorization',
            )

        if not user.is_active:
            raise serializers.ValidationError(
                _('Учётная запись деактивирована'),
                code='authorization',
            )

        attrs['user'] = user
        return attrs


class AccessDefinitionSerializer(serializers.Serializer):
    code = serializers.CharField()
    name = serializers.CharField()
    category = serializers.CharField()
    description = serializers.CharField()


class PositionAccessRuleSerializer(serializers.ModelSerializer):
    permission_name = serializers.SerializerMethodField()

    class Meta:
        model = PositionAccessRule
        fields = [
            'id',
            'position',
            'normalized_position',
            'permission_code',
            'permission_name',
            'is_allowed',
            'is_active',
            'comment',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['normalized_position', 'created_at', 'updated_at']

    def get_permission_name(self, obj):
        match = next((item for item in ACCESS_DEFINITIONS if item.code == obj.permission_code), None)
        return match.name if match else obj.permission_code


class UserAccessOverrideSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True, default='')
    username = serializers.CharField(source='user.username', read_only=True, default='')
    permission_name = serializers.SerializerMethodField()

    class Meta:
        model = UserAccessOverride
        fields = [
            'id',
            'user',
            'user_name',
            'username',
            'permission_code',
            'permission_name',
            'mode',
            'comment',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_permission_name(self, obj):
        match = next((item for item in ACCESS_DEFINITIONS if item.code == obj.permission_code), None)
        return match.name if match else obj.permission_code
