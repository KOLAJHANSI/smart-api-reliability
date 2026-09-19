from django.urls import path , include
from rest_framework.routers import DefaultRouter
from monitors.views import APIMonitorViewSet , IncidentViewSet

router = DefaultRouter()
router.register('monitors',APIMonitorViewSet,basename='monitor')
router.register('incidents',IncidentViewSet,basename='incidents')


urlpatterns = [
    path('',include(router.urls)),
]