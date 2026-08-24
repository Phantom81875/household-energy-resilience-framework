from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView
)
urlpatterns = [
    path('register/', views.register),
    path('login/', TokenObtainPairView.as_view()),
    path('logout/', TokenBlacklistView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('check/username/', views.check_username),
    path('check/password/', views.check_password),
    path('households/', views.households),
    path('households/<int:household_id>/', views.households_id),
    path('households/<int:household_id>/select/', views.household_id_select),
    path('households/active/', views.household_active),
    path('households/<int:household_id>/appliances/', views.appliances),
    path('households/<int:household_id>/appliances/<int:appliance_id>/', views.appliances_id),
    path('households/<int:household_id>/batteries/', views.batteries),
    path('households/<int:household_id>/batteries/<int:battery_id>/', views.batteries_id),
    path('households/<int:household_id>/energysupply/', views.energysupply_id)
]