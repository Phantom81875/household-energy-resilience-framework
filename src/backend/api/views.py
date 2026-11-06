
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from . import serializers
from . import models


# USER REGISTRATION
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

            models.EnergySupply.objects.create(
                household=house,
                wattage=0
            )

        return Response(
            {"message": f"Successfully created user {user.username}"},
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# USERNAME VALIDATION
@api_view(["POST"])
def check_username(request):
    serializer = serializers.UsernameValidationSerializer(data=request.data)

    if serializer.is_valid():
        return Response({"valid": True})

    return Response(
        {"valid": False, "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )


# PASSWORD VALIDATION
@api_view(["POST"])
def check_password(request):
    serializer = serializers.PasswordValidationSerializer(data=request.data)

    if serializer.is_valid():
        return Response({"valid": True})

    return Response(
        {"valid": False, "errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST
    )


# HOUSEHOLDS
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
            with transaction.atomic():
                house = serializer.save(owner=request.user)

                models.EnergySupply.objects.create(
                    household=house,
                    wattage=0
                )

            return Response(
                {"message": f"Successfully created Household {house.name}"},
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# INDIVIDUAL HOUSEHOLD
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
        serializer = serializers.HouseholdsSerializer(
            house,
            data=request.data,
            partial=True
        )

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
                id=house.id
            ).order_by("?").first()

            active_household.house = new_house
            active_household.save()

        house.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


# SELECT ACTIVE HOUSEHOLD
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


# GET ACTIVE HOUSEHOLD
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def household_active(request):

    serializer = serializers.HouseholdsSerializer(
        request.user.activehousehold.house
    )

    return Response(serializer.data)


# APPLIANCES
@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def appliances(request, household_id):

    house = get_object_or_404(
        models.Household,
        id=household_id,
        owner=request.user
    )

    if request.method == "GET":
        appliance_list = house.appliances.all()
        serializer = serializers.ApplianceSerializer(
            appliance_list,
            many=True
        )
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = serializers.ApplianceSerializer(data=request.data)

        if serializer.is_valid():
            appliance = serializer.save(household=house)

            return Response(
                {"message": f"Successfully created Appliance {appliance.name}"},
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# INDIVIDUAL APPLIANCE
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
        serializer = serializers.ApplianceSerializer(
            appliance,
            data=request.data,
            partial=True
        )

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


# BATTERIES
@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def batteries(request, household_id):

    house = get_object_or_404(
        models.Household,
        id=household_id,
        owner=request.user
    )

    if request.method == "GET":
        battery_list = house.batteries.all()
        serializer = serializers.BatterySerializer(
            battery_list,
            many=True
        )
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = serializers.BatterySerializer(data=request.data)

        if serializer.is_valid():
            battery = serializer.save(household=house)

            return Response(
                {"message": f"Successfully created Battery {battery.name}"},
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# INDIVIDUAL BATTERY
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
        serializer = serializers.BatterySerializer(
            battery,
            data=request.data,
            partial=True
        )

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


# ENERGY SUPPLY
@api_view(["PATCH", "GET"])
@permission_classes([IsAuthenticated])
def energysupply_id(request, household_id):

    house = get_object_or_404(
        models.Household,
        id=household_id,
        owner=request.user
    )

    energysupply, created = models.EnergySupply.objects.get_or_create(
        household=house,
        defaults={"wattage": 0}
    )

    if request.method == "GET":
        serializer = serializers.EnergySupplySerializer(energysupply)
        return Response(serializer.data)

    elif request.method == "PATCH":
        serializer = serializers.EnergySupplySerializer(
            energysupply,
            data=request.data,
            partial=True
        )

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
