from rest_framework.routers import DefaultRouter

from .views import MovimientoFinancieroViewSet

router = DefaultRouter()
router.register("expenses", MovimientoFinancieroViewSet, basename="expense")

urlpatterns = router.urls
