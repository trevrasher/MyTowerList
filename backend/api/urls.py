from django.urls import path
from . import views, oauth
from .views import GetAllTowersByScore, GetTowerByName, GetGameBadgesCSV, SyncTowerCompletions, GetCompletedTowers, GetEligibleAreas
urlpatterns = [
    path('auth/roblox/', oauth.roblox_login, name='roblox-login'),
    path('auth/roblox/callback/', oauth.roblox_callback, name='roblox-callback'),
    path('auth/user/', oauth.current_user, name='current-user'),
    path('towers/<str:tower_name>/', GetTowerByName.as_view, name='tower-detail'),
    path('towers/', GetAllTowersByScore.as_view(), name='tower-list'),
    path('badges/csv/', GetGameBadgesCSV.as_view(), name='game-badges-csv'),
    path('sync-completions/', SyncTowerCompletions.as_view(), name='sync-completions'),
    path('profile/completed-towers/', GetCompletedTowers.as_view(), name='get-completed'),
    path('profile/available-areas/', GetEligibleAreas.as_view(), name = 'get-avail')
]