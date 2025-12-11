from django.urls import path
from . import views, oauth
from .views import GetAllTowersByScore, GetTowerByName, GetGameBadgesCSV, SyncTowerCompletions, GetCompletedTowers, GetEligibleAreas, TowerListView, GetUserProfile, HealthCheck, GetTowerCompletion
from rest_framework_simplejwt.views import TokenRefreshView
urlpatterns = [
    path('auth/roblox/', oauth.roblox_login, name='roblox-login'),
    path('auth/roblox/callback/', oauth.roblox_callback, name='roblox-callback'),
    path('auth/user/', oauth.current_user, name='current-user'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('towers/<str:name>/', GetTowerByName.as_view(), name='tower-detail'),
    path('towers/', TowerListView.as_view(), name='tower-list'),
    path('badges/csv/', GetGameBadgesCSV.as_view(), name='game-badges-csv'),
    path('sync-completions/', SyncTowerCompletions.as_view(), name='sync-completions'),
    path('profile/completed-towers/', GetCompletedTowers.as_view(), name='get-completed'),
    path('profile/available-areas/', GetEligibleAreas.as_view(), name = 'get-avail'),
    path('profile/', GetUserProfile.as_view(), name = 'get-current-user'),
    path('health/', HealthCheck.as_view(), name='health-check'),
    path('towers/<int:tower_id>}/completion/', GetTowerCompletion.as_view(), name='tower-completion')
]