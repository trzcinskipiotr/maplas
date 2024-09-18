from django.core.management.base import BaseCommand

from django.conf import settings
from maplas_app.models import StringField, Track

from maplas_app import utils

from maplas_app import serializers

import os

import time
import json

from django.http import HttpRequest

class UserAuth(object):
    is_authenticated = True

class UserNoAuth(object):
    is_authenticated = False

class RequestAuth(object):
    user = UserAuth

class RequestNoAuth(object):
    user = UserNoAuth

class Command(BaseCommand):

    def get_cache_filename(self, endpoint, revision):
        return '/var/cache/maplas/{}.{}'.format(endpoint, revision)

    def handle(self, *args, **options):
        last_revision = None
        request_in = HttpRequest()
        request_in.user = None
        request_out = HttpRequest()
        request_out.user = None
        context_auth = {'request': request_in}
        context_no_auth = {'request': request_out}
        while True:
            revision = StringField.objects.filter(key=settings.DATA_REVISION_KEY).first().value
            if revision and revision == last_revision:
                if not (os.path.isfile(self.get_cache_filename('tracksbicyclein', revision))):
                    os.system('rm -Rf /var/cache/maplas/tracksbicyclein.*')
                    with open(self.get_cache_filename('tracksbicyclein', revision), "w") as text_file:
                        queryset = Track.objects.all().order_by('-start_time').filter(type__in=[Track.Type.bicycle, Track.Type.walk])
                        serializer = serializers.TrackSerializerRegionNested(queryset, many=True, context=context_auth)
                        text_file.write(json.dumps(serializer.data))
                if not (os.path.isfile(self.get_cache_filename('tracksmushroomin', revision))):
                    os.system('rm -Rf /var/cache/maplas/tracksmushroomin.*')
                    with open(self.get_cache_filename('tracksmushroomin', revision), "w") as text_file:
                        queryset = Track.objects.all().order_by('-start_time').filter(type=Track.Type.mushroom)
                        serializer = serializers.TrackSerializerRegionNested(queryset, many=True, context=context_auth)
                        text_file.write(json.dumps(serializer.data))
                if not (os.path.isfile(self.get_cache_filename('tracksbicycleout', revision))):
                    os.system('rm -Rf /var/cache/maplas/tracksbicycleout.*')
                    with open(self.get_cache_filename('tracksbicycleout', revision), "w") as text_file:
                        queryset = Track.objects.all().order_by('-start_time').filter(type__in=[Track.Type.bicycle, Track.Type.walk])
                        serializer = serializers.TrackSerializerRegionNested(queryset, many=True, context=context_no_auth)
                        text_file.write(json.dumps(serializer.data))
                if not (os.path.isfile(self.get_cache_filename('tracksmushroomout', revision))):
                    os.system('rm -Rf /var/cache/maplas/tracksmushroomout.*')
                    with open(self.get_cache_filename('tracksmushroomout', revision), "w") as text_file:
                        queryset = Track.objects.all().order_by('-start_time').filter(type=Track.Type.mushroom)
                        serializer = serializers.TrackSerializerRegionNested(queryset, many=True, context=context_no_auth)
                        text_file.write(json.dumps(serializer.data))
            time.sleep(5)
            last_revision = revision