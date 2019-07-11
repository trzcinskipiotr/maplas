from django.urls import path, include
from rest_framework import routers

from maplas_app import api_views

router = routers.DefaultRouter()
router.register(r'tracks', api_views.TrackViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
