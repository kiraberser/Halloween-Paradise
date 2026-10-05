from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import EmailTokenObtainPairView, FotosOfrendaView, MeView, RegisterView, UsuariosAdminView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/token/", EmailTokenObtainPairView.as_view(), name="token_obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("users/", UsuariosAdminView.as_view(), name="users"),
    path("users/photos/", FotosOfrendaView.as_view(), name="user_photos"),
]
