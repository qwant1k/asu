"""URL-маршруты документооборота ИС «АСУ»."""

from rest_framework.routers import DefaultRouter

from .views import (
    IncomingInvoiceViewSet,
    WriteOffActViewSet,
    PetitionViewSet,
    CommissionProtocolViewSet,
    InternalTransferInvoiceViewSet,
)

app_name = 'documents'

router = DefaultRouter()
router.register('incoming-invoices', IncomingInvoiceViewSet, basename='incoming-invoices')
router.register('write-off-acts', WriteOffActViewSet, basename='write-off-acts')
router.register('petitions', PetitionViewSet, basename='petitions')
router.register('protocols', CommissionProtocolViewSet, basename='protocols')
router.register('internal-transfers', InternalTransferInvoiceViewSet, basename='internal-transfers')

urlpatterns = router.urls
