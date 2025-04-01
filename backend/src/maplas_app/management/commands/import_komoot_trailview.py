import json
import sys
import time
from wsgiref import headers

from django.conf import settings

import requests
import geopandas
from vt2geojson.tools import vt_bytes_to_geojson

from django.core.management.base import BaseCommand
import os

from maplas_app.models import StringField, update_revision

from PIL import Image

#https://b.tiles-api.maps.komoot.net/v1/tiles/poi/13/4513/2667.vector.pbf?cache-version=1

PUSZCZA_NOTECKA = [[52.60444, 15.42921], [52.87802, 16.98279]]
PUSZCZA_BYDGOSKA = [[52.83056, 17.88215], [53.11460, 18.75272]]
BORY1 = [[53.44593, 16.79063], [54.14647, 18.74028]]

AREAS = [PUSZCZA_NOTECKA, PUSZCZA_BYDGOSKA, BORY1]

class Command(BaseCommand):

    def is_to_import(self, lat, lon):
        for area in AREAS:
            if area[0][0] < lat and lat < area[1][0]:
                if area[0][1] < lon and lon < area[1][1]:
                    return True
        return False

    def handle(self, *args, **options):
        x1 = 275
        x2 = 291
        y1 = 162
        y2 = 176
        zoom = 9
        maindir = '/tmp/import_komoot_trailview_{}/'.format(time.time_ns())
        os.mkdir(maindir)
        mainzoomdir = '{}{}/'.format(maindir, zoom)
        os.mkdir(mainzoomdir)
        points = []
        min_lat = 2000
        max_lat = -2000
        min_lon = 2000
        max_lon = -2000
        processed = 0
        komoot_string_field = StringField.objects.get(key='KOMOOTTRAILVIEW')
        db_object = json.loads(komoot_string_field.value)
        db_object_dict = {}
        for item in db_object:
            db_object_dict[item['id']] = item
        image_headers = {'Cookie': 'kmt_rid=0058db9f5edf3a8601f1a1842cabcb4e3e05e982a3d9137aca; _ga=GA1.1.369933700.1739791813; _hjSessionUser_5024555=eyJpZCI6ImMxM2ZjMTdkLTk3YWEtNTFlMy04ZmUzLTdlOGU0YTAxOTQwZSIsImNyZWF0ZWQiOjE3Mzk3OTE4MTI2ODQsImV4aXN0aW5nIjp0cnVlfQ==; __stripe_mid=e72a2b5f-5664-4227-a392-2cfc3eee6299d1a6f0; kmt_sess=eyJsYW5nIjoicGwiLCJtZXRyaWMiOnRydWUsInByb2ZpbGUiOnsidXNlcm5hbWUiOiI4Mjk1MTcxMjk2MDMiLCJsb2NhbGUiOiJwbF9QTCIsIm1ldHJpYyI6dHJ1ZX19; kmt_sess.sig=rTVdDTdrnsWkcjIM3bHW-3So0jM; koa_re=1775025886; koa_rt=829517129603%7C%2F829517129603%2Fkomoot-web%2F4fec6016-a586-4807-a2b4-efdef78d02b0%7C1775025886; koa_ae=1743491626; koa_at=829517129603%7CeyJ4NXQjUzI1NiI6InlIQ2xZdUdwWlNvU2c3dkhrT1k4YzYyR2NGdGxSeV9neEpIYkJfNFpjamsiLCJraWQiOiJqd3QtMjAyNTAyMTEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJydGkiOiJhOGNlMTU5MzQ4YzQzMTkxMmE0NmYzMGYzOGI0MDA1ZGQ2YTYzNDVhYmU5MDMyZGI0MjZjZTIwMjMyZmE0MTVkIiwidXNlcl9uYW1lIjoiODI5NTE3MTI5NjAzIiwic2NvcGUiOlsidXNlci4qIl0sImV4cCI6MTc0MzQ5MTY4NiwiaWF0IjoxNzQzNDg5ODg2LCJqdGkiOiIyYTc3NWNlMC1mMGYzLTQzMTEtOWU0OS01ODc2NjQ1OTVkN2IiLCJjbGllbnRfaWQiOiJrb21vb3Qtd2ViIiwidXNlcm5hbWUiOiI4Mjk1MTcxMjk2MDMifQ.SP9D7Av_Syl6-3LxJj2hmTj_E6Wusr92qe0ixr9nDcSaVeE_vyq_QRsEMT-_tDgcOwJFkLPMN7rxyqfraZba_c71FQTeugwyWv2CGYsmEYdTlBbAXoc43c1obWG83O_cFBiQ1nNihsen7L_JGnL2Xa4JxAgwQrEyam7YMhZBHi1uvn8IWf-lA6BV3oDHu6jt2Yep52ub6LbD_5AAjGgE1QoSugJwikBZkH9c9rPsrAhNl9fIy-SRMjhx3acRSuOah5TkRmlmPcmb_J2d928A-3XpKPIKtikO9LW92-vEp_9FicE-iDkrZlD392c_ve094cAVhmUhwjuRyxUqAAk4VQ%7C1743491626; _ga_R7DCLCR1RB=GS1.1.1743486925.10.1.1743490496.6.0.0; _dd_s=rum=0&expire=1743491396819'}
        for x in range(x1, x2 + 1):
            xdir = '{}{}/'.format(mainzoomdir, x)
            os.mkdir(xdir)
            for y in range(y1, y2 + 1):
                url = 'https://trailview-tiles.maps.komoot.net/tiles/v2/{}/{}/{}.vector.pbf'.format(zoom, x, y)
                response = requests.get(url)
                if response.status_code == 200:
                    content = response.content
                    yfilename = '{}{}.vector.pbf'.format(xdir, y)
                    with open(yfilename, "wb") as f:
                        f.write(content)
                    features = vt_bytes_to_geojson(content, x, y, zoom)
                    for feature in features['features']:
                        lon = feature['geometry']['coordinates'][0]
                        lat = feature['geometry']['coordinates'][1]
                        if self.is_to_import(lat, lon):
                            id = feature['properties']['trailview_id']
                            if id in db_object_dict:
                                points.append(db_object_dict[id])
                                processed += 1
                                print(processed)
                            else:
                                point = {'id': id, 'lat': lat, 'lon': lon, 'photo': '', 'details': '', 'feature': feature}
                                if lat < min_lat:
                                    min_lat = lat
                                if lat > max_lat:
                                    max_lat = lat
                                if lon < min_lon:
                                    min_lon = lon
                                if lon > max_lon:
                                    max_lon = lon
                                image_url = 'https://www.komoot.com/api/trailview/v1/images/{}?hl=pl'.format(id)
                                response_image = requests.get(image_url, headers=image_headers)
                                if response_image.status_code == 200:
                                    response_image_json = response_image.json()
                                    photo_link = response_image_json['image']['src']
                                    point['photo'] = photo_link.split('?')[0]
                                    point['details'] = response_image_json
                                    time.sleep(0.1)
                                    processed += 1
                                    print(processed)
                                    points.append(point)
                                else:
                                    print('{}: response: {}'.format(image_url, response_image.status_code))
                else:
                    print('{}: response: {}'.format(url, response.status_code))
        print(len(points))
        for point in points:
            id = point['id']
            filename = '{}{}.jpg'.format(settings.KOMOOT_TRAIL_VIEW_IMG, id)
            thumb_filename = '{}{}_thumb.jpg'.format(settings.KOMOOT_TRAIL_VIEW_IMG, id)
            if not os.path.isfile(filename):
                response_jpg = requests.get(point['photo'])
                if response_jpg.status_code == 200:
                    with open(filename, "wb") as f:
                        f.write(response_jpg.content)
                        time.sleep(0.1)
            if not os.path.isfile(thumb_filename):
                image = Image.open(filename)
                image.thumbnail((300, 300))
                image.save(thumb_filename)
        print('LON: {} {}'.format(min_lon, max_lon))
        print('LAT: {} {}'.format(min_lat, max_lat))
        komoot_string_field = StringField.objects.get(key='KOMOOTTRAILVIEW')
        komoot_string_field.value = json.dumps(points)
        komoot_string_field.save()
        update_revision(None, None)
