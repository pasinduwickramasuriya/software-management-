from rest_framework import serializers
from .models import User, Branch, UserType


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['bid', 'branch_name']


class UserTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserType
        fields = ['type_id', 'user_type']


class UserSerializer(serializers.ModelSerializer):
    user_type = serializers.CharField(source='type.user_type', read_only=True)
    branch_name = serializers.CharField(source='branch.branch_name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'user_type',
            'branch',
            'branch_name',
            'is_staff',
            'is_superuser',
        ]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
