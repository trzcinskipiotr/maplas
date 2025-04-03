import time
import os
import json
import requests

from vt2geojson.tools import vt_bytes_to_geojson

from django.core.management import BaseCommand
from django.conf import settings

from maplas_app.gps_utils import gps2tile
from maplas_app.models import StringField

PUSZCZA_NOTECKA = [[52.60444, 15.42921], [52.87802, 16.98279]]
PUSZCZA_BYDGOSKA = [[52.83056, 17.88215], [53.11460, 18.75272]]
BORY1 = [[53.44593, 16.79063], [54.14647, 18.74028]]

POLAND = [[49, 14], [54.5, 24.1]]
NORTH_WEST_POLAND = [[], []]

AREAS_TO_IMPORT = [PUSZCZA_NOTECKA, PUSZCZA_BYDGOSKA, BORY1]
AREA_TO_DOWNLOAD = POLAND

class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument('type', type=str, choices=['poi', 'trailview'])
        parser.add_argument('zoom', type=int, choices=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])

    def is_to_import(self, lat, lon):
        for area in AREAS_TO_IMPORT:
            if area[0][0] < lat and lat < area[1][0]:
                if area[0][1] < lon and lon < area[1][1]:
                    return True
        return False

    def handle(self, *args, **options):
        zoom = options['zoom']
        type = options['type']
        x1tmp, y1tmp = gps2tile(AREA_TO_DOWNLOAD[0][0], AREA_TO_DOWNLOAD[0][1], zoom)
        x2tmp, y2tmp = gps2tile(AREA_TO_DOWNLOAD[1][0], AREA_TO_DOWNLOAD[1][1], zoom)
        x1 = min(x1tmp, x2tmp)
        x2 = max(x1tmp, x2tmp)
        y1 = min(y1tmp, y2tmp)
        y2 = max(y1tmp, y2tmp)
        print('X=[{}-{}], Y=[{}-{}]'.format(x1, x2, y1, y2))
        tiles_to_process = (x2-x1+1)*(y2-y1+1)
        print('Tiles to process: {}'.format(tiles_to_process))
        time.sleep(2)

        if type == 'poi':
            DATABASE_KEY='KOMOOTPOI_{}'.format(zoom)
            DATABASE_DETAILS_KEY='KOMOOTPOI_DETAILS'
            MAINDIR = settings.KOMOOTPOI_DOWNLOAD_DIR
            TILE_URL = 'https://b.tiles-api.maps.komoot.net/v1/tiles/poi/{}/{}/{}.vector.pbf?cache-version=1'
        if type == 'trailview':
            DATABASE_KEY = 'KOMOOTTRAILVIEW_{}'.format(zoom)
            DATABASE_DETAILS_KEY = 'KOMOOTTRAILVIEW_DETAILS'
            MAINDIR = settings.KOMOOTTRAILVIEW_DOWNLOAD_DIR
            TILE_URL = 'https://trailview-tiles.maps.komoot.net/tiles/v2/{}/{}/{}.vector.pbf'
        if StringField.objects.filter(key=DATABASE_KEY).count() == 0:
            StringField.objects.create(key=DATABASE_KEY, value='[]')
        if StringField.objects.filter(key=DATABASE_DETAILS_KEY).count() == 0:
            StringField.objects.create(key=DATABASE_DETAILS_KEY, value='{}')
        mainzoomdir = '{}{}/'.format(MAINDIR, zoom)
        if not os.path.isdir(MAINDIR):
            os.mkdir(MAINDIR)
        if not os.path.isdir(mainzoomdir):
            os.mkdir(mainzoomdir)

        points_to_save = []
        details_to_download = 0
        details_downloaded_ok = 0
        details_download_failed = 0
        details_from_cache = 0
        tiles_to_download = 0
        tiles_downloaded_ok = 0
        tiles_download_failed = 0
        tiles_from_cache = 0
        tiles_processed = 0
        db_value = StringField.objects.get(key=DATABASE_KEY)
        db_value_json = json.loads(db_value.value)
        db_details_value = StringField.objects.get(key=DATABASE_DETAILS_KEY)
        db_details_value_json = json.loads(db_details_value.value)
        points_in_db_dict = {}
        for item in db_value_json:
            points_in_db_dict[item['id']] = item
        details_in_db_dict = {}
        for point_id in db_details_value_json.keys():
            details_in_db_dict[point_id] = db_details_value_json[point_id]
        for x in range(x1, x2 + 1):
            xdir = '{}{}/'.format(mainzoomdir, x)
            if not os.path.isdir(xdir):
                os.mkdir(xdir)
            for y in range(y1, y2 + 1):
                content = None
                yfilename = '{}{}.vector.pbf'.format(xdir, y)
                if os.path.isfile(yfilename):
                    tiles_from_cache += 1
                    with open(yfilename, 'rb') as f:
                        content = f.read()
                else:
                    tiles_to_download += 1
                    url = TILE_URL.format(zoom, x, y)
                    response = requests.get(url)
                    if response.status_code == 200 or response.status_code == 204:
                        tiles_downloaded_ok += 1
                        content = response.content
                        with open(yfilename, "wb") as f:
                            f.write(content)
                    else:
                        tiles_download_failed += 1
                        print('{}: response: {}'.format(url, response.status_code))
                if content:
                    features = vt_bytes_to_geojson(content, x, y, zoom)
                    for feature in features['features']:
                        lon = feature['geometry']['coordinates'][0]
                        lat = feature['geometry']['coordinates'][1]
                        if self.is_to_import(lat, lon):
                            id = feature['properties']['id']
                            point = {'id': id, 'lat': lat, 'lon': lon, 'feature': feature, 'details': None}
                            if id in details_in_db_dict:
                                details_from_cache += 1
                                point['details'] = details_in_db_dict[id]
                            else:
                                details_to_download += 1
                                if details_to_download >= 1000:
                                    continue
                                if type == 'poi':
                                    if point['id'].isnumeric():
                                        details_url = 'https://www.komoot.com/api/v007/highlights/{}?_embedded=coordinates%2Cimages%2Ctips%2Crecommenders%2Cbookmark&_embedded.tips=rating&_embedded.images=rating'.format(point['id'])
                                        headers = {}
                                    else:
                                        details_url = 'https://www.komoot.com/api/v007/pois/{}?_embedded=saved%2Cexternal_reviews&username=829517129603&hl=pl'.format(point['id'])
                                        headers = {'Cookie': 'kmt_rid=0058db9f5edf3a8601f1a1842cabcb4e3e05e982a3d9137aca; _ga=GA1.1.369933700.1739791813; _hjSessionUser_5024555=eyJpZCI6ImMxM2ZjMTdkLTk3YWEtNTFlMy04ZmUzLTdlOGU0YTAxOTQwZSIsImNyZWF0ZWQiOjE3Mzk3OTE4MTI2ODQsImV4aXN0aW5nIjp0cnVlfQ==; __stripe_mid=e72a2b5f-5664-4227-a392-2cfc3eee6299d1a6f0; koa_re=1775228781; koa_rt=829517129603%7C%2F829517129603%2Fkomoot-web%2F4fec6016-a586-4807-a2b4-efdef78d02b0%7C1775228781; koa_ae=1743694521; koa_at=829517129603%7CeyJ4NXQjUzI1NiI6InlIQ2xZdUdwWlNvU2c3dkhrT1k4YzYyR2NGdGxSeV9neEpIYkJfNFpjamsiLCJraWQiOiJqd3QtMjAyNTAyMTEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJydGkiOiJhOGNlMTU5MzQ4YzQzMTkxMmE0NmYzMGYzOGI0MDA1ZGQ2YTYzNDVhYmU5MDMyZGI0MjZjZTIwMjMyZmE0MTVkIiwidXNlcl9uYW1lIjoiODI5NTE3MTI5NjAzIiwic2NvcGUiOlsidXNlci4qIl0sImV4cCI6MTc0MzY5NDU4MSwiaWF0IjoxNzQzNjkyNzgxLCJqdGkiOiJhMDVhYzM1NC01ZTQwLTQ0ZmYtOGRmNS0zMTkyNDZlNTk3NzciLCJjbGllbnRfaWQiOiJrb21vb3Qtd2ViIiwidXNlcm5hbWUiOiI4Mjk1MTcxMjk2MDMifQ.YstxnZmAgitiXF-PDN3Lwqg33pDpFBwatlU4RdxCDGRREZckeMtvGL3FKreEqurY_aKGhHQGisQfIyfxHYt4Sp_nJoUFWsojfIttWaQP7rnZaDou0R3I8zxn4rm-bseoor0jZn-oA6R9go7PyH9jKYdeDYs5EGdQWFdBl4td46RFTR8_ExNLaEqHP5ql0CF_5V6RLcfFKyIFQ-KG-UvsZOVzH_aX2QyGSEFmI0_HAVzeJMRpx4s2aIp2OnI48YL50GFp0Ytk7oG9kaHzUBdYU9VFCA6kmzkNbRwo6WW8awj4FvDo6TYsNZ2ypnILw6B0LixPJCN-92k1cUP8XyMf0g%7C1743694521; kmt_sess=eyJsYW5nIjoicGwiLCJtZXRyaWMiOnRydWUsInByb2ZpbGUiOnsidXNlcm5hbWUiOiI4Mjk1MTcxMjk2MDMiLCJsb2NhbGUiOiJwbF9QTCIsIm1ldHJpYyI6dHJ1ZX19; kmt_sess.sig=rTVdDTdrnsWkcjIM3bHW-3So0jM; _ga_R7DCLCR1RB=GS1.1.1743692781.19.1.1743692790.51.0.0; _dd_s=rum=0&expire=1743693689845'}
                                    response_details = requests.get(details_url, headers=headers)
                                    if response_details.status_code == 200:
                                        details_downloaded_ok += 1
                                        response_details_json = response_details.json()
                                        point['details'] = response_details_json
                                        details_in_db_dict[id] = response_details_json
                                        time.sleep(0.1)
                                    else:
                                        details_download_failed += 1
                                        print('{}: response: {}'.format(details_url, response_details.status_code))
                            points_to_save.append(point)
                tiles_processed += 1
                print(tiles_processed)



        print()
        print('Tiles to process: {}'.format(tiles_to_process))
        print('Tiles loaded from cache: {}'.format(tiles_from_cache))
        print('Tiles to download: {}'.format(tiles_to_download))
        print('Tiles downloaded OK: {}'.format(tiles_downloaded_ok))
        print('Tiles download failed: {}'.format(tiles_download_failed))

        komoot_string_field = StringField.objects.get(key=DATABASE_KEY)
        komoot_string_field.value = json.dumps(points_to_save)
        komoot_string_field.save()

        komoot_string_field = StringField.objects.get(key=DATABASE_DETAILS_KEY)
        komoot_string_field.value = json.dumps(details_in_db_dict)
        komoot_string_field.save()

        print('Points to save: {}'.format(len(points_to_save)))
        print('Details loaded from cache: {}'.format(details_from_cache))
        print('Details to download: {}'.format(details_to_download))
        print('Details downloaded OK: {}'.format(details_downloaded_ok))
        print('Details download failed: {}'.format(details_download_failed))