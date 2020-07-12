from django.urls import path, include
from rest_framework import routers

from maplas_app import api_views

router = routers.DefaultRouter()
router.register(r'tracks', api_views.TrackViewSet)
router.register(r'regions', api_views.RegionViewSet)
router.register(r'places', api_views.PlaceViewSet)
router.register(r'placetypes', api_views.PlaceTypeViewSet)
router.register(r'photos', api_views.PhotoViewSet)
router.register(r'areas', api_views.AreaViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.authtoken')),
]
