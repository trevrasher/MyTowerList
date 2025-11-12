from django.urls import path
from . import views, oauth

urlpatterns = [
    path('auth/roblox/', oauth.roblox_login, name='roblox-login'),
    path('auth/roblox/callback/', oauth.roblox_callback, name='roblox-callback'),
    path('auth/user/', oauth.current_user, name='current-user'),
    path('towers/<str:tower_name>/', views.get_tower_by_name, name='tower-detail'),
]