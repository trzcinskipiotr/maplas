import json
import sys
import time
import math

from django.conf import settings

import requests
import geopandas
from vt2geojson.tools import vt_bytes_to_geojson

from django.core.management.base import BaseCommand
import os

from maplas_app.gps_utils import gps2tile
from maplas_app.models import StringField, update_revision

from PIL import Image

#https://b.tiles-api.maps.komoot.net/v1/tiles/poi/13/4513/2667.vector.pbf?cache-version=1

PUSZCZA_NOTECKA = [[52.60444, 15.42921], [52.87802, 16.98279]]
PUSZCZA_BYDGOSKA = [[52.83056, 17.88215], [53.11460, 18.75272]]
BORY1 = [[53.44593, 16.79063], [54.14647, 18.74028]]

POLAND = [[49, 14], [54.5, 24.1]]

AREAS = [PUSZCZA_NOTECKA, PUSZCZA_BYDGOSKA, BORY1]

class Command(BaseCommand):

    def handle(self, *args, **options):
        pois = json.loads(StringField.objects.filter(key='KOMOOTPOI').first().value)
        all = len(pois)
        photos = 0
        nophotos = 0
        name = 0
        noname = 0
        name_pl = 0
        noname_pl = 0
        numeric_id = 0
        nonnumeric_id = 0
        for poi in pois:
            if poi['photo']:
                photos += 1
            else:
                nophotos += 1
            if 'name' in poi['feature']['properties']:
                name += 1
            else:
                noname += 1
            if 'name_pl' in poi['feature']['properties']:
                name_pl += 1
            else:
                noname_pl += 1
            if poi['id'].isnumeric():
                numeric_id += 1
            else:
                nonnumeric_id += 1
            if poi['id'] == 'N0676':
                print(json.dumps(poi))
                print()
            #if poi['id'].isnumeric() and not poi['photo']:
            #    print(json.dumps(poi))
            #    print()
        print('All: {}'.format(all))
        print('Photo: {}'.format(photos))
        print('No photo: {}'.format(nophotos))
        print('Name: {}'.format(name))
        print('Noname: {}'.format(noname))
        print('Name PL: {}'.format(name_pl))
        print('Noname PL: {}'.format(noname_pl))
        print('Numeric ID: {}'.format(numeric_id))
        print('NonNumeric ID: {}'.format(nonnumeric_id))