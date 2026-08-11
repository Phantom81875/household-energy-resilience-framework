from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from . import serializers

@api_view(["POST"])
def register(request):
    serializer = serializers.UserSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        return Response(
                {"message": f"Succefully created user {user.username}"},
                status=status.HTTP_201_CREATED
        )
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(["POST"])
def check_username(request):
    serializer = serializers.UsernameValidationSerializer(data=request.data)

    if serializer.is_valid():
        return Response(
            {"valid": True}
        )

    return Response(
        {"valid": False, "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )

@api_view(["POST"])
def check_password(request):
    serializer = serializers.PasswordValidationSerializer(data=request.data)

    if serializer.is_valid():
        return Response(
            {"valid": True}
        )

    return Response(
        {"valid": False, "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )