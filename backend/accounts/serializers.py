from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from core.storage import image_url
from tickets.serializers import BoletoSerializer, boleto_activo

from .models import User


class UserSerializer(serializers.ModelSerializer):
    genero_display = serializers.CharField(source="get_genero_display", read_only=True)
    boleto = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id", "username", "email", "first_name", "last_name", "telefono",
            "genero", "genero_display", "fecha_nacimiento", "foto_perfil",
            "is_staff", "date_joined", "boleto",
        )
        read_only_fields = ("id", "username", "is_staff", "date_joined")

    def get_boleto(self, obj):
        boleto = boleto_activo(obj.compras.all())
        return BoletoSerializer(boleto).data if boleto else None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = (
            "email", "password", "first_name", "last_name", "telefono",
            "genero", "fecha_nacimiento", "foto_perfil",
        )
        extra_kwargs = {"first_name": {"required": True}, "last_name": {"required": True}}

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        # El correo se usa como nombre de usuario para iniciar sesión.
        user = User(username=validated_data["email"], **validated_data)
        user.set_password(password)
        user.save()
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Permite iniciar sesión con correo (o con username, para el superuser)."""

    def validate(self, attrs):
        login = attrs.get(self.username_field, "")
        user = User.objects.filter(email__iexact=login).first()
        if user:
            attrs[self.username_field] = user.username
        return super().validate(attrs)


class FotoOfrendaSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source="get_full_name")
    foto_impresion = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "nombre", "foto_perfil", "foto_impresion")

    def get_foto_impresion(self, obj):
        # En Cloudinary: recorte 4:5 centrado en la cara, listo para imprimir.
        url = image_url(obj.foto_perfil, width=800, height=1000, crop="fill", gravity="face", quality="auto")
        request = self.context.get("request")
        return request.build_absolute_uri(url) if request and url and url.startswith("/") else url
