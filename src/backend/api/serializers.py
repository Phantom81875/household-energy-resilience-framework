from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from . import models

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id' ,'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate_email(self, value):
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError(
                    "That email is already in use"
                )
            return value
    def create(self, validated_data):
         return User.objects.create_user(**validated_data)
class UsernameValidationSerializer(serializers.ModelSerializer):
    class Meta:
         model = User
         fields = ["username"]

class PasswordValidationSerializer(serializers.Serializer):
    password = serializers.CharField()

    def validate_password(self, value):
        validate_password(value)
        return value

class HouseholdsSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Household
        fields = ["id" ,"name", "type"]

class HouseholdActiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.ActiveHousehold
        fields = ["house"]

class ApplianceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Appliance
        fields = ["id", "name", "category", "wattage", "priority", "usage", "active"]
        