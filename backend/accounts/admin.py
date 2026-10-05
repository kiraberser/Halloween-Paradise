from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "first_name", "last_name", "genero", "miniatura", "date_joined", "is_staff")
    list_filter = UserAdmin.list_filter + ("genero",)
    fieldsets = UserAdmin.fieldsets + (
        ("Halloween Paradise", {"fields": ("telefono", "genero", "fecha_nacimiento", "foto_perfil")}),
    )

    @admin.display(description="Foto")
    def miniatura(self, obj):
        if obj.foto_perfil:
            return format_html('<img src="{}" style="height:40px;border-radius:50%" />', obj.foto_perfil.url)
        return "—"
