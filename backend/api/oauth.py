"""
Custom Roblox OAuth implementation
"""
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
import secrets

User = get_user_model()

ROBLOX_AUTHORIZE_URL = 'https://apis.roblox.com/oauth/v1/authorize'
ROBLOX_TOKEN_URL = 'https://apis.roblox.com/oauth/v1/token'
ROBLOX_USERINFO_URL = 'https://apis.roblox.com/oauth/v1/userinfo'


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['GET'])
@permission_classes([AllowAny])
def roblox_login(request):
    state = secrets.token_urlsafe(32)
    request.session['oauth_state'] = state
    
    params = {
        'client_id': settings.ROBLOX_CLIENT_ID,
        'redirect_uri': settings.ROBLOX_REDIRECT_URI,
        'scope': 'openid profile',
        'response_type': 'code',
        'state': state,
    }
    
    auth_url = f"{ROBLOX_AUTHORIZE_URL}?{'&'.join(f'{k}={v}' for k, v in params.items())}"
    return redirect(auth_url)


@api_view(['GET'])
@permission_classes([AllowAny])
def roblox_callback(request):
    
    state = request.GET.get('state')
    stored_state = request.session.get('oauth_state')
    
    if not state or state != stored_state:
        return Response({'error': 'Invalid state parameter'}, status=400)
    
    # Get authorization code
    code = request.GET.get('code')
    if not code:
        return Response({'error': 'No authorization code provided'}, status=400)
    
    try:
        # Exchange code for access token
        token_data = {
            'client_id': settings.ROBLOX_CLIENT_ID,
            'client_secret': settings.ROBLOX_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': settings.ROBLOX_REDIRECT_URI,
        }
        
        token_response = requests.post(ROBLOX_TOKEN_URL, data=token_data)
        token_response.raise_for_status()
        token_json = token_response.json()
        access_token = token_json.get('access_token')
        
        if not access_token:
            return Response({'error': 'No access token received'}, status=400)
        
        # Fetch user info from Roblox
        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(ROBLOX_USERINFO_URL, headers=headers)
        user_response.raise_for_status()
        roblox_user = user_response.json()
        
        print("DEBUG: Roblox user data:", roblox_user)
        
        # Create or get Django user
        roblox_id = roblox_user.get('sub')
        username = roblox_user.get('preferred_username', f'roblox_{roblox_id}')
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'first_name': roblox_user.get('name', ''),
            }
        )
        
        # Generate JWT tokens
        tokens = get_tokens_for_user(user)
        
        # Redirect to frontend with tokens
        frontend_url = settings.FRONTEND_URL
        redirect_url = f"{frontend_url}/auth/callback?access={tokens['access']}&refresh={tokens['refresh']}"
        
        return redirect(redirect_url)
        
    except requests.RequestException as e:
        print(f"DEBUG: OAuth error: {e}")
        return Response({'error': f'OAuth request failed: {str(e)}'}, status=400)
    except Exception as e:
        print(f"DEBUG: Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': f'Authentication failed: {str(e)}'}, status=500)


@api_view(['GET'])
def current_user(request):
    """Get current authenticated user info"""
    if request.user.is_authenticated:
        return Response({
            'authenticated': True,
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
        })
    return Response({'authenticated': False})
