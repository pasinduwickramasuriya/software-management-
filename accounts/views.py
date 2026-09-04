from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from .serializers import (
    LoginSerializer,
    UserSerializer,
    UserCreateSerializer,
    BranchSerializer,
    UserTypeSerializer,
)
from .models import User, Branch, UserType


def is_admin_user(user):
    return user.is_superuser or (user.type and user.type.user_type == 'Admin')


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {'detail': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token, _ = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user).data

        return Response({
            'token': token.key,
            'user': user_data
        })


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'detail': 'Successfully logged out.'})


class BranchListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        branches = Branch.objects.all()
        return Response(BranchSerializer(branches, many=True).data)

    def post(self, request):
        if not is_admin_user(request.user):
            return Response({'detail': 'Only administrators can create branches.'}, status=status.HTTP_403_FORBIDDEN)
        branch_name = request.data.get('branch_name')
        if not branch_name or not branch_name.strip():
            return Response({'detail': 'Branch name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        branch = Branch.objects.create(branch_name=branch_name.strip())
        return Response(BranchSerializer(branch).data, status=status.HTTP_201_CREATED)


class DeveloperListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        developers = User.objects.filter(type__user_type='Developer')
        return Response(UserSerializer(developers, many=True).data)


class UserTypeListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        roles = UserType.objects.all()
        return Response(UserTypeSerializer(roles, many=True).data)


class UserManagementView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not is_admin_user(request.user):
            return Response({'detail': 'Only administrators can view user management.'}, status=status.HTTP_403_FORBIDDEN)
        users = User.objects.all().order_by('-id')
        return Response(UserSerializer(users, many=True).data)

    def post(self, request):
        if not is_admin_user(request.user):
            return Response({'detail': 'Only administrators can create users.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        if not is_admin_user(request.user):
            return Response({'detail': 'Only administrators can delete users.'}, status=status.HTTP_403_FORBIDDEN)
        if request.user.id == int(pk):
            return Response({'detail': 'You cannot delete your own account.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(pk=pk)
            user.delete()
            return Response({'detail': 'User deleted successfully.'})
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    # def patch(self, request, pk):
    #     if not is_admin_user(request.user):
    #         return Response({'detail': 'Only administrators can update users.'}, status=status.HTTP_403_FORBIDDEN)
    #     try:
    #         user = User.objects.get(pk=pk)
    #         if 'is_active' in request.data:
    #             user.is_active = bool(request.data['is_active'])
    #         if 'branch' in request.data:
    #             user.branch_id = request.data['branch']
    #         if 'type_id' in request.data:
    #             user.type_id = request.data['type_id']
    #         user.save()
    #         return Response(UserSerializer(user).data)
    #     except User.DoesNotExist:
    #         return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)



    def patch(self, request, pk):
        if not is_admin_user(request.user):
            return Response({'detail': 'Only administrators can update users.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(pk=pk)
            if 'is_active' in request.data:
                user.is_active = bool(request.data['is_active'])
            if 'branch' in request.data:
                user.branch_id = request.data['branch']
            if 'type_id' in request.data:
                new_type_id = request.data['type_id']
                if new_type_id:
                    new_role = UserType.objects.get(type_id=new_type_id)
                    
                    # Prevent assigning IT Director if another user already has it
                    if new_role.user_type == 'IT Director':
                        if User.objects.filter(type__user_type='IT Director').exclude(pk=user.pk).exists():
                            return Response(
                                {'detail': 'Only ONE IT Director is allowed in the entire system.'},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        user.branch = None  # IT Director oversees all branches

                    # Prevent assigning IT Main Developer if another user already has it
                    elif new_role.user_type == 'IT Main Developer':
                        if User.objects.filter(type__user_type='IT Main Developer').exclude(pk=user.pk).exists():
                            return Response(
                                {'detail': 'Only ONE IT Main Developer is allowed in the entire system.'},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        user.branch = None  # IT Main oversees all branches

                    user.type = new_role
                else:
                    user.type = None

            user.save()
            return Response(UserSerializer(user).data)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        except UserType.DoesNotExist:
            return Response({'detail': 'Invalid role.'}, status=status.HTTP_400_BAD_REQUEST)
