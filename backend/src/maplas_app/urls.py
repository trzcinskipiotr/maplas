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
router.register(r'maplayers', api_views.MapLayerViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/datarevision/', api_views.datarevision),
    path('api/addpoints/', api_views.addpoints),
    path('api/gpspoint/', api_views.gpspoint),
    path('api/loggeduserinfo/', api_views.loggeduserinfo),
    path('api/loginuser/', api_views.loginuser),
    path('api/stringfield/<str:key>/', api_views.stringfield),
]
