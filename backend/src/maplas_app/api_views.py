from rest_framework import viewsets
from rest_framework.mixins import ListModelMixin, UpdateModelMixin, CreateModelMixin, RetrieveModelMixin

from maplas_app import serializers
from maplas_app.models import Track, Region, Place, PlaceType, Photo, Area, MapLayer, StringField, GpsPoint
from maplas_app.utils import fill_array_from_gpx_file

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from rest_framework.permissions import AllowAny

from django.conf import settings

import os
import json

def get_cache_filename(endpoint):
    revision = StringField.objects.filter(key=settings.DATA_REVISION_KEY).first()
    if revision:
        return '/var/cache/maplas/{}.{}'.format(endpoint, revision.value)
    else:
        return None

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

    def cache_list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        bicycle = self.request.query_params.get('bicycle', None)
        mushroom = self.request.query_params.get('mushroom', None)
        filename = get_cache_filename('tracks')
        if bicycle:
            filename = get_cache_filename('tracksbicycle')
        if mushroom:
            filename = get_cache_filename('tracksmushroom')
        if os.path.isfile(filename):
            try:
                with open(filename, 'r') as content_file:
                    content = content_file.read()
                    return Response(json.loads(content))
            except:
                return Response(serializer.data)
        else:
            return Response(serializer.data)


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
    queryset = PlaceType.objects.all().order_by('group__order', 'order')
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

@api_view(['GET'])
def gpspoint(request):
    gpspoint = GpsPoint.objects.order_by('-time').first()
    if gpspoint:
        gpspoint_serializer = serializers.GpsPointSerializer(gpspoint, many=False)
        return Response({"gpspoint": gpspoint_serializer.data})
    else:
        return Response({"error": "no gpspoint in DB"}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def addpoints(request):
    points = request.data['points']
    print(points)
    for point in points:
        GpsPoint.objects.create(lat=point['lat'], lon=point['lon'], time=point['time'], name='')
    return Response({"OK": "OK"})