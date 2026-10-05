from rest_framework.routers import DefaultRouter

from .views import TipoBoletoViewSet, VentaBoletoViewSet

router = DefaultRouter()
router.register("ticket-types", TipoBoletoViewSet, basename="ticket-type")
router.register("sales", VentaBoletoViewSet, basename="sale")

urlpatterns = router.urls
