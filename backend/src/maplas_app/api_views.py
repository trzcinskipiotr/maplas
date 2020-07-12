from rest_framework import viewsets, permissions
from rest_framework.mixins import ListModelMixin, UpdateModelMixin, CreateModelMixin, RetrieveModelMixin
from rest_framework.pagination import PageNumberPagination

from maplas_app import serializers
from maplas_app.models import Track, Region, Place, PlaceType, Photo, Area
from maplas_app.utils import fill_array_from_gpx_file


class LargeResultsSetPagination(PageNumberPagination):
    page_size = 1000
    page_size_query_param = 'page_size'
    max_page_size = 1000

class TrackViewSet(ListModelMixin, UpdateModelMixin, RetrieveModelMixin, CreateModelMixin, viewsets.GenericViewSet):
    queryset = Track.objects.all().order_by('-start_time')
    list_serializer_class = serializers.TrackSerializerRegionNested
    create_update_serializer_class = serializers.TrackSerializer
    create_update_no_gpx_serializer_class = serializers.TrackSerializerNoGpx
    retrieve_serializer_class = serializers.TrackSerializerFull
    pagination_class = LargeResultsSetPagination
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

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
    pagination_class = LargeResultsSetPagination

class PlaceViewSet(ListModelMixin, CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Place.objects.all().order_by('id')
    pagination_class = LargeResultsSetPagination
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
    queryset = PlaceType.objects.all().order_by('id')
    serializer_class = serializers.PlaceTypeSerializer
    pagination_class = LargeResultsSetPagination

class PhotoViewSet(ListModelMixin, CreateModelMixin, viewsets.GenericViewSet):
    queryset = Photo.objects.all().order_by('id')
    pagination_class = LargeResultsSetPagination
    list_serializer_class = serializers.PhotoSerializerUrlNested
    create_update_serializer_class = serializers.PhotoSerializer
    retrieve_serializer_class = serializers.PhotoSerializerUrlNested

    def get_serializer_class(self):
        if self.action == 'list':
            return self.list_serializer_class
        if self.action == 'retrieve':
            return self.retrieve_serializer_class
        return self.create_update_serializer_class

class AreaViewSet(ListModelMixin, CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Area.objects.all().order_by('id')
    pagination_class = LargeResultsSetPagination
    serializer_class = serializers.AreaSerializer
