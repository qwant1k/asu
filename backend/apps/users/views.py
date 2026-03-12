import secrets
import string

from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.permissions import IsAdmin

from .models import Department, User
from .serializers import (
    DepartmentSerializer,
    DepartmentTreeSerializer,
    LoginSerializer,
    UserCreateSerializer,
    UserProfileSerializer,
    UserSerializer,
)


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
    permission_classes = [IsAdmin]
    filterset_fields = ['role', 'department', 'is_active']
    search_fields = ['username', 'first_name', 'last_name', 'email', 'patronymic']
    ordering_fields = ['last_name', 'date_joined', 'role']
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
