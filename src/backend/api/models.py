from django.db import models
from django.contrib.auth.models import User

class Household(models.Model):
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="households"
    )
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=100)

class ActiveHousehold(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="activehousehold"
    )
    house = models.ForeignKey(
        Household,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

class Appliance(models.Model):
    household = models.ForeignKey(
        Household,
        on_delete=models.CASCADE,
        related_name="appliances"
    )
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    wattage = models.IntegerField()
    priority = models.IntegerField()
    usage = models.FloatField()
    active = models.BooleanField()