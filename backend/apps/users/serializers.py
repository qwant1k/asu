from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from .models import Department, User


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
    supervisor_name = serializers.CharField(source='supervisor.get_short_name', read_only=True, default='')

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
            'department',
            'department_name',
            'phone',
            'role',
            'supervisor',
            'supervisor_name',
            'is_active',
            'date_joined',
            'full_name',
            'short_name',
        ]
        read_only_fields = ['date_joined']


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
            'department',
            'phone',
            'role',
            'supervisor',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Current user profile serializer."""

    full_name = serializers.CharField(source='get_full_name', read_only=True)
    short_name = serializers.CharField(source='get_short_name', read_only=True)
    photo = serializers.ImageField(required=False, allow_null=True)
    remove_photo = serializers.BooleanField(write_only=True, required=False, default=False)
    department_name = serializers.CharField(source='department.name', read_only=True, default='')
    supervisor_name = serializers.CharField(source='supervisor.get_short_name', read_only=True, default='')

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
        ]
        read_only_fields = ['id', 'username', 'role', 'date_joined', 'supervisor']

    def update(self, instance, validated_data):
        remove_photo = validated_data.pop('remove_photo', False)
        if remove_photo and instance.photo:
            instance.photo.delete(save=False)
            instance.photo = None
        return super().update(instance, validated_data)


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
