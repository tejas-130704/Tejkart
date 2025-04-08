from rest_framework import serializers
from django.contrib.auth.models import User

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password": "Passwords must match!"})
        return data

    def create(self, validated_data):
        validated_data.pop("password2")  # Remove password2 before creating the user
        user = User.objects.create_user(**validated_data)
        return user
