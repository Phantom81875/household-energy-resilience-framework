from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from . import serializers
from . import models


@api_view(["POST"])
def register(request):
    serializer = serializers.UserSerializer(data=request.data)

    if serializer.is_valid():
        with transaction.atomic():
            user = serializer.save()
            house = models.Household.objects.create(
                owner=user,
                name="Default Household",
                type="single-family"
            )
            models.ActiveHousehold.objects.create(
                user=user,
                house=house
            )
        
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

@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def households(request):
    if request.method == "GET":
        houses = request.user.households.all()
        serializer = serializers.HouseholdsSerializer(houses, many=True)

        return Response(serializer.data)
    elif request.method == "POST":
        serializer = serializers.HouseholdsSerializer(data=request.data)

        if serializer.is_valid():
            house = serializer.save(owner=request.user)
            return Response(
                    {"message": f"Succefully created Household {house.name}"},
                    status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
@api_view(["PATCH", "GET", "DELETE"])
@permission_classes([IsAuthenticated])
def households_id(request, household_id):
    house = get_object_or_404(
        models.Household,
        id=household_id,
        owner=request.user
    )

    if request.method == "GET":
        serializer = serializers.HouseholdsSerializer(house)
        return Response(serializer.data)
    elif request.method == "PATCH":
        serializer = serializers.HouseholdsSerializer(house, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    elif request.method == "DELETE":
        if request.user.households.count() <= 1:
            return Response(
                {"error": "You must have at least one household."},
                status=status.HTTP_400_BAD_REQUEST
            )
        active_household = request.user.activehousehold
        if house == active_household.house:
            new_house = request.user.households.exclude(
                id = house.id
            ).order_by("?").first()

            active_household.house = new_house
            active_household.save()
        house.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def household_id_select(request, household_id):
    house = get_object_or_404(
        models.Household,
        id=household_id,
        owner=request.user
    )
    active_household = request.user.activehousehold

    active_household.house = house
    active_household.save()

    return Response(
        {"message": f"Opened {house.name}"},
        status=status.HTTP_200_OK
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def household_active(request):
    serializer = serializers.HouseholdsSerializer(request.user.activehousehold.house)
    return Response(serializer.data)

@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def appliances(request, household_id):
    house = get_object_or_404(
        models.Household,
        id=household_id,
        owner=request.user
    )
    if request.method == "GET":
        appliances = house.appliances.all()
        serializer = serializers.ApplianceSerializer(appliances, many=True)

        return Response(serializer.data)
    elif request.method == "POST":
        serializer = serializers.ApplianceSerializer(data=request.data)

        if serializer.is_valid():
            appliance = serializer.save(household=house)
            return Response(
                    {"message": f"Succefully created Appliance {appliance.name}"},
                    status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
@api_view(["PATCH", "GET", "DELETE"])
@permission_classes([IsAuthenticated])
def appliances_id(request, household_id, appliance_id):
    house = get_object_or_404(
        models.Household,
        id=household_id,
        owner=request.user
    )

    appliance = get_object_or_404(
        models.Appliance,
        household=house,
        id=appliance_id       
    )

    if request.method == "GET":
        serializer = serializers.ApplianceSerializer(appliance)
        return Response(serializer.data)
    elif request.method == "PATCH":
        serializer = serializers.ApplianceSerializer(appliance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    elif request.method == "DELETE":
        appliance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def batteries(request, household_id):
    house = get_object_or_404(
        models.Household,
        id=household_id,
        owner=request.user
    )
    if request.method == "GET":
        batteries = house.batteries.all()
        serializer = serializers.BatterySerializer(batteries, many=True)

        return Response(serializer.data)
    elif request.method == "POST":
        serializer = serializers.BatterySerializer(data=request.data)

        if serializer.is_valid():
            battery = serializer.save(household=house)
            return Response(
                    {"message": f"Succefully created Battery {battery.name}"},
                    status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
@api_view(["PATCH", "GET", "DELETE"])
@permission_classes([IsAuthenticated])
def batteries_id(request, household_id, battery_id):
    house = get_object_or_404(
        models.Household,
        id=household_id,
        owner=request.user
    )

    battery = get_object_or_404(
        models.Battery,
        household=house,
        id=battery_id       
    )

    if request.method == "GET":
        serializer = serializers.BatterySerializer(battery)
        return Response(serializer.data)
    elif request.method == "PATCH":
        serializer = serializers.BatterySerializer(battery, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    elif request.method == "DELETE":
        battery.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(["PATCH", "GET"])
@permission_classes([IsAuthenticated])
def energysupply_id(request, household_id):
    house = get_object_or_404(
        models.Household,
        id=household_id,
        owner=request.user
    )
    energysupply = get_object_or_404(
        models.EnergySupply,
        household = house
    )
    if request.method == "PATCH":
        serializer = serializers.EnergySupplySerializer(energysupply, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    elif request.method == "GET":
        serializer = serializers.EnergySupplySerializer(energysupply)
        return Response(serializer.data)