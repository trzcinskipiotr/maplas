from rest_framework import viewsets, permissions
from rest_framework.mixins import ListModelMixin, UpdateModelMixin
from rest_framework.pagination import PageNumberPagination

from maplas_app import serializers
from maplas_app.models import Track


class LargeResultsSetPagination(PageNumberPagination):
    page_size = 1000
    page_size_query_param = 'page_size'
    max_page_size = 1000

class TrackViewSet(ListModelMixin, UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Track.objects.all().order_by('-start_time')
    serializer_class = serializers.TrackSerializer
    pagination_class = LargeResultsSetPagination
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
