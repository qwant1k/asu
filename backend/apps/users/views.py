import secrets
import string

from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .filters import UserFilter
from .access import ACCESS_DEFINITIONS, ROLE_DEFAULT_ACCESS, effective_access_detail, has_access
from .models import Department, PositionAccessRule, User, UserAccessOverride
from .serializers import (
    AccessDefinitionSerializer,
    DepartmentSerializer,
    DepartmentTreeSerializer,
    LoginSerializer,
    PositionAccessRuleSerializer,
    UserAccessOverrideSerializer,
    UserCreateSerializer,
    UserProfileSerializer,
    UserSerializer,
)


class CanManageUsers(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        action = getattr(view, 'action', '')
        if action in ('list', 'retrieve') and has_access(request.user, 'access.manage'):
            return True
        return has_access(request.user, 'users.manage')


class CanManageAccess(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and has_access(request.user, 'access.manage'))


class LoginView(APIView):
    """Authenticate user and issue JWT tokens."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserProfileSerializer(user, context={'request': request}).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """Invalidate refresh token."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """Retrieve and update the current user's profile."""

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get_object(self):
        return self.request.user

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class UserViewSet(viewsets.ModelViewSet):
    """User CRUD for admins."""

    queryset = User.objects.select_related('department', 'supervisor').all()
    permission_classes = [CanManageUsers]
    filterset_class = UserFilter
    search_fields = [
        'username', 'first_name', 'last_name', 'email', 'patronymic',
        'phone', 'position', 'department__name', 'supervisor__last_name',
    ]
    ordering_fields = ['last_name', 'date_joined', 'last_login', 'role', 'is_active']
    ordering = ['last_name', 'first_name']
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        user = self.get_object()
        alphabet = string.ascii_letters + string.digits + '!@#$%'
        temp_password = ''.join(secrets.choice(alphabet) for _ in range(12))
        user.set_password(temp_password)
        user.save(update_fields=['password'])
        return Response(
            {
                'detail': f'Временный пароль: {temp_password}',
                'temp_password': temp_password,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['post'], url_path='change-password')
    def change_password(self, request, pk=None):
        user = self.get_object()
        password = request.data.get('password') or request.data.get('new_password')

        if not password:
            return Response(
                {'password': ['Введите новый пароль.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            password_validation.validate_password(password, user)
        except DjangoValidationError as exc:
            return Response({'password': list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save(update_fields=['password'])
        return Response({'detail': 'Пароль пользователя изменен.'}, status=status.HTTP_200_OK)


class AccessDefinitionView(APIView):
    """Available permissions and role defaults."""

    permission_classes = [CanManageAccess]

    def get(self, request):
        return Response({
            'permissions': AccessDefinitionSerializer(ACCESS_DEFINITIONS, many=True).data,
            'role_defaults': {
                role: sorted(codes)
                for role, codes in ROLE_DEFAULT_ACCESS.items()
            },
        })


class EffectiveUserAccessView(APIView):
    """Effective permissions for one user."""

    permission_classes = [CanManageAccess]

    def get(self, request, user_id):
        user = User.objects.select_related('department', 'supervisor').get(pk=user_id)
        return Response(effective_access_detail(user))


class PositionAccessRuleViewSet(viewsets.ModelViewSet):
    """CRUD for permissions inherited by position."""

    queryset = PositionAccessRule.objects.all()
    serializer_class = PositionAccessRuleSerializer
    permission_classes = [CanManageAccess]
    search_fields = ['position', 'permission_code', 'comment']
    ordering_fields = ['position', 'permission_code', 'is_allowed', 'is_active']
    ordering = ['position', 'permission_code']


class UserAccessOverrideViewSet(viewsets.ModelViewSet):
    """CRUD for personal permission overrides."""

    queryset = UserAccessOverride.objects.select_related('user').all()
    serializer_class = UserAccessOverrideSerializer
    permission_classes = [CanManageAccess]
    filterset_fields = ['user', 'permission_code', 'mode']
    search_fields = ['user__username', 'user__last_name', 'user__first_name', 'permission_code', 'comment']
    ordering_fields = ['user__last_name', 'permission_code', 'mode']
    ordering = ['user__last_name', 'user__first_name', 'permission_code']


class DepartmentViewSet(viewsets.ModelViewSet):
    """Department CRUD."""

    queryset = Department.objects.select_related('head', 'parent').all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code']
    ordering = ['name']

    @action(detail=False, methods=['get'], url_path='tree')
    def tree(self, request):
        roots = Department.objects.filter(parent__isnull=True).select_related('head')
        serializer = DepartmentTreeSerializer(roots, many=True)
        return Response(serializer.data)
