from rest_framework import viewsets
from rest_framework.mixins import ListModelMixin, UpdateModelMixin, CreateModelMixin, RetrieveModelMixin

from maplas_app import serializers
from maplas_app.models import Track, Region, Place, PlaceType, Photo, Area, MapLayer, StringField
from maplas_app.utils import fill_array_from_gpx_file

from rest_framework.decorators import api_view
from rest_framework.response import Response

from django.conf import settings

class TrackViewSet(ListModelMixin, UpdateModelMixin, RetrieveModelMixin, CreateModelMixin, viewsets.GenericViewSet):
    queryset = Track.objects.all().order_by('-start_time')
    list_serializer_class = serializers.TrackSerializerRegionNested
    create_update_serializer_class = serializers.TrackSerializer
    create_update_no_gpx_serializer_class = serializers.TrackSerializerNoGpx
    retrieve_serializer_class = serializers.TrackSerializerFull

    def get_queryset(self):
        bicycle = self.request.query_params.get('bicycle', None)
        mushroom = self.request.query_params.get('mushroom', None)
        queryset = None
        if bicycle is not None:
            queryset = self.queryset.filter(type__in=[Track.Type.bicycle, Track.Type.walk])
        elif mushroom is not None:
            queryset = self.queryset.filter(type=Track.Type.mushroom)
        return queryset or self.queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return self.list_serializer_class
        if self.action == 'retrieve':
            return self.retrieve_serializer_class
        nogpx = self.request.query_params.get('nogpx', None)
        if nogpx:
            return self.create_update_no_gpx_serializer_class
        return self.create_update_serializer_class

    def perform_create(self, serializer):
        nogpx = self.request.query_params.get('nogpx', None)
        track = serializer.save()
        if not nogpx:
            fill_array_from_gpx_file(track)

class RegionViewSet(ListModelMixin, viewsets.GenericViewSet):
    queryset = Region.objects.all().order_by('id')
    serializer_class = serializers.RegionSerializer

class MapLayerViewSet(ListModelMixin, viewsets.GenericViewSet):
    queryset = MapLayer.objects.filter(is_active=True).order_by('order')
    serializer_class = serializers.MapLayerSerializer

class PlaceViewSet(ListModelMixin, CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Place.objects.all().order_by('id')
    list_serializer_class = serializers.PlaceSerializerTypeNested
    create_update_serializer_class = serializers.PlaceSerializer
    retrieve_serializer_class = serializers.PlaceSerializerTypeNested

    def get_serializer_class(self):
        if self.action == 'list':
            return self.list_serializer_class
        if self.action == 'retrieve':
            return self.retrieve_serializer_class
        return self.create_update_serializer_class

class PlaceTypeViewSet(ListModelMixin, viewsets.GenericViewSet):
    queryset = PlaceType.objects.all().order_by('order')
    serializer_class = serializers.PlaceTypeSerializer

class PhotoViewSet(ListModelMixin, CreateModelMixin, UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Photo.objects.all().order_by('order', 'id')
    list_serializer_class = serializers.PhotoSerializerUrlNested
    create_update_serializer_class = serializers.PhotoSerializer
    retrieve_serializer_class = serializers.PhotoSerializerUrlNested

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Photo.objects.all().order_by('order', 'id')
        else:
            return Photo.objects.filter(private=False).order_by('order', 'id')

    def get_serializer_class(self):
        if self.action == 'list':
            return self.list_serializer_class
        if self.action == 'retrieve':
            return self.retrieve_serializer_class
        return self.create_update_serializer_class

class AreaViewSet(ListModelMixin, CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Area.objects.none()
    basic_serializer_class = serializers.AreaSerializer
    full_serializer_class =serializers.AreaSerializerFull

    def get_serializer_class(self):
        full = self.request.query_params.get('full', None)
        if full:
            return self.full_serializer_class
        return self.basic_serializer_class

@api_view(['GET'])
def datarevision(request):
    revision = StringField.objects.filter(key=settings.DATA_REVISION_KEY).first()
    if revision:
        return Response({"datarevision": revision.value})
    else:
        return Response({"error": "no data revision in DB"}, status=500)