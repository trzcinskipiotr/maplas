from rest_framework import viewsets, permissions
from rest_framework.mixins import ListModelMixin, UpdateModelMixin, CreateModelMixin
from rest_framework.pagination import PageNumberPagination

from maplas_app import serializers
from maplas_app.models import Track, Place
from maplas_app.utils import fill_array_from_gpx_file


class LargeResultsSetPagination(PageNumberPagination):
    page_size = 1000
    page_size_query_param = 'page_size'
    max_page_size = 1000

class TrackViewSet(ListModelMixin, UpdateModelMixin, CreateModelMixin, viewsets.GenericViewSet):
    queryset = Track.objects.all().order_by('-start_time')
    retrieve_serializer_class = serializers.TrackSerializerPlaceNested
    create_update_serializer_class = serializers.TrackSerializer
    pagination_class = LargeResultsSetPagination
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'list':
            return self.retrieve_serializer_class
        return self.create_update_serializer_class

    def perform_create(self, serializer):
        track = serializer.save()
        fill_array_from_gpx_file(track)

class PlaceViewSet(ListModelMixin, viewsets.GenericViewSet):
    queryset = Place.objects.all().order_by('id')
    serializer_class = serializers.PlaceSerializer
    pagination_class = LargeResultsSetPagination
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
