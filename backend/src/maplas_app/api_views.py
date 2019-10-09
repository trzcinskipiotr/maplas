from rest_framework import viewsets, permissions
from rest_framework.mixins import ListModelMixin, UpdateModelMixin, CreateModelMixin, RetrieveModelMixin
from rest_framework.pagination import PageNumberPagination

from maplas_app import serializers
from maplas_app.models import Track, Place
from maplas_app.utils import fill_array_from_gpx_file


class LargeResultsSetPagination(PageNumberPagination):
    page_size = 1000
    page_size_query_param = 'page_size'
    max_page_size = 1000

class TrackViewSet(ListModelMixin, UpdateModelMixin, RetrieveModelMixin, CreateModelMixin, viewsets.GenericViewSet):
    queryset = Track.objects.all().order_by('-start_time')
    list_serializer_class = serializers.TrackSerializerPlaceNested
    create_update_serializer_class = serializers.TrackSerializer
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
        return self.create_update_serializer_class

    def perform_create(self, serializer):
        track = serializer.save()
        fill_array_from_gpx_file(track)

class PlaceViewSet(ListModelMixin, viewsets.GenericViewSet):
    queryset = Place.objects.all().order_by('id')
    serializer_class = serializers.PlaceSerializer
    pagination_class = LargeResultsSetPagination
