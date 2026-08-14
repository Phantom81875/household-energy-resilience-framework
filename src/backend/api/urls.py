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
    path('households/<int:id>/', views.households_id),
    path('households/<int:id>/select/', views.household_id_select),
    path('households/active/', views.household_active),
    path('households/<int:id>/appliances/', views.appliances),
    path('households/<int:id1>/appliances/<int:id2>/', views.appliances_id),
]