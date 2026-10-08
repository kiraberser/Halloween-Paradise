from django.db.models import CharField, Exists, OuterRef, Prefetch, Q
from django.db.models.functions import Cast
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.permissions import IsSuperuser
from core.seguridad import evento
from tickets.models import VentaBoleto

from .models import User
from .serializers import EmailTokenObtainPairSerializer, FotoOfrendaSerializer, RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    throttle_scope = "registro"  # frena el registro masivo de cuentas falsas


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    throttle_scope = "login"  # frena los intentos de adivinar contraseñas


class RefreshView(TokenRefreshView):
    throttle_scope = "login"


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user


class FotosOfrendaView(generics.ListAPIView):
    """Fotos de perfil para imprimir como decoración de Día de Muertos."""

    serializer_class = FotoOfrendaSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        return User.objects.exclude(foto_perfil="").exclude(foto_perfil__isnull=True).order_by("first_name")


class UsuariosAdminView(generics.ListAPIView):
    """Usuarios registrados con su boleto vigente (solo staff).

    Filtros: ``?boleto=con|pendiente|sin``, ``?rol=staff`` y ``?search=`` (nombre, correo, teléfono o folio).
    """

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = []

    def get_queryset(self):
        ventas = VentaBoleto.objects.filter(usuario=OuterRef("pk"))
        pagado = Exists(ventas.filter(estado=VentaBoleto.Estado.PAGADO))
        vigente = Exists(ventas.exclude(estado=VentaBoleto.Estado.CANCELADO))
        qs = (
            User.objects.prefetch_related(Prefetch("compras", queryset=VentaBoleto.objects.select_related("tipo")))
            .order_by("-date_joined")
        )

        if self.request.query_params.get("rol") == "staff":
            qs = qs.filter(is_staff=True)

        filtro = self.request.query_params.get("boleto")
        if filtro == "con":
            qs = qs.filter(pagado)
        elif filtro == "pendiente":
            qs = qs.filter(vigente).exclude(pagado)
        elif filtro == "sin":
            qs = qs.exclude(vigente)

        search = self.request.query_params.get("search", "").strip()
        if search:
            cond = (
                Q(first_name__icontains=search) | Q(last_name__icontains=search)
                | Q(email__icontains=search) | Q(telefono__icontains=search)
            )
            folio = search.upper().removeprefix("HP-").replace("-", "").lower()
            if len(folio) >= 4 and all(c in "0123456789abcdef" for c in folio):
                # Los primeros 8 caracteres del UUID coinciden en PostgreSQL (con guiones) y SQLite (hex).
                por_folio = ventas.annotate(cod=Cast("codigo", CharField())).filter(cod__startswith=folio[:8])
                cond |= Exists(por_folio)
            qs = qs.filter(cond)
        return qs


class StaffToggleView(APIView):
    """El admin da o quita el permiso de staff (acceso al dashboard). ``{"is_staff": true|false}``"""

    permission_classes = [IsSuperuser]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        if user == request.user:
            return Response({"detail": "No puedes cambiar tus propios permisos."}, status=status.HTTP_400_BAD_REQUEST)
        if user.is_superuser:
            return Response({"detail": "No se pueden cambiar los permisos de otro administrador."},
                            status=status.HTTP_400_BAD_REQUEST)
        user.is_staff = bool(request.data.get("is_staff"))
        user.save(update_fields=["is_staff"])
        evento("staff_cambiado", request, usuario=user.get_username(), is_staff=user.is_staff)
        return Response(UserSerializer(user, context={"request": request}).data)
