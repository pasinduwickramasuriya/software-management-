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
    type_id = serializers.IntegerField(source='type.type_id', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'type_id',
            'user_type',
            'branch',
            'branch_name',
            'is_active',
            'is_staff',
            'is_superuser',
            'date_joined',
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    type_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'type_id', 'branch']

    def create(self, validated_data):
        password = validated_data.pop('password')
        type_id = validated_data.pop('type_id', None)
        user = User(**validated_data)
        if type_id:
            try:
                user.type = UserType.objects.get(type_id=type_id)
            except UserType.DoesNotExist:
                pass
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
