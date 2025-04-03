import json
import time
import os
import requests

from django.conf import settings
from django.core.management.base import BaseCommand

from vt2geojson.tools import vt_bytes_to_geojson
from PIL import Image

from maplas_app.gps_utils import gps2tile
from maplas_app.models import StringField, update_revision

PUSZCZA_NOTECKA = [[52.60444, 15.42921], [52.87802, 16.98279]]
PUSZCZA_BYDGOSKA = [[52.83056, 17.88215], [53.11460, 18.75272]]
BORY1 = [[53.44593, 16.79063], [54.14647, 18.74028]]

POLAND = [[49, 14], [54.5, 24.1]]

AREAS = [PUSZCZA_NOTECKA, PUSZCZA_BYDGOSKA, BORY1]

class Command(BaseCommand):

    def is_to_import(self, lat, lon):
        for area in AREAS:
            if area[0][0] < lat and lat < area[1][0]:
                if area[0][1] < lon and lon < area[1][1]:
                    return True
        return False

    def handle(self, *args, **options):
        zoom = 12
        x1tmp, y1tmp = gps2tile(POLAND[0][0], POLAND[0][1], zoom)
        x2tmp, y2tmp = gps2tile(POLAND[1][0], POLAND[1][1], zoom)
        x1 = min(x1tmp, x2tmp)
        x2 = max(x1tmp, x2tmp)
        y1 = min(y1tmp, y2tmp)
        y2 = max(y1tmp, y2tmp)
        print(x1, y1, x2, y2)
        print((x2-x1+1)*(y2-y1+1))

        DATABASE_KEY='KOMOOTTRAILVIEW_{}'.format(zoom)
        if StringField.objects.filter(key=DATABASE_KEY).count() == 0:
            StringField.objects.create(key=DATABASE_KEY, value='[]')
        maindir = '/Users/piotr.trzcinski/KOMOOTTRAILVIEW/'
        if not os.path.isdir(maindir):
            os.mkdir(maindir)
        mainzoomdir = '{}{}/'.format(maindir, zoom)
        if not os.path.isdir(mainzoomdir):
            os.mkdir(mainzoomdir)
        points = []
        processed = 0
        komoot_string_field = StringField.objects.get(key=DATABASE_KEY)
        db_object = json.loads(komoot_string_field.value)
        db_object_dict = {}
        for item in db_object:
            db_object_dict[item['id']] = item
        image_headers = {'Cookie': 'kmt_rid=0058db9f5edf3a8601f1a1842cabcb4e3e05e982a3d9137aca; _ga=GA1.1.369933700.1739791813; _hjSessionUser_5024555=eyJpZCI6ImMxM2ZjMTdkLTk3YWEtNTFlMy04ZmUzLTdlOGU0YTAxOTQwZSIsImNyZWF0ZWQiOjE3Mzk3OTE4MTI2ODQsImV4aXN0aW5nIjp0cnVlfQ==; __stripe_mid=e72a2b5f-5664-4227-a392-2cfc3eee6299d1a6f0; kmt_sess=eyJsYW5nIjoicGwiLCJtZXRyaWMiOnRydWUsInByb2ZpbGUiOnsidXNlcm5hbWUiOiI4Mjk1MTcxMjk2MDMiLCJsb2NhbGUiOiJwbF9QTCIsIm1ldHJpYyI6dHJ1ZX19; kmt_sess.sig=rTVdDTdrnsWkcjIM3bHW-3So0jM; koa_re=1775109811; koa_rt=829517129603%7C%2F829517129603%2Fkomoot-web%2F4fec6016-a586-4807-a2b4-efdef78d02b0%7C1775109811; koa_ae=1743575551; koa_at=829517129603%7CeyJ4NXQjUzI1NiI6InlIQ2xZdUdwWlNvU2c3dkhrT1k4YzYyR2NGdGxSeV9neEpIYkJfNFpjamsiLCJraWQiOiJqd3QtMjAyNTAyMTEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJydGkiOiJhOGNlMTU5MzQ4YzQzMTkxMmE0NmYzMGYzOGI0MDA1ZGQ2YTYzNDVhYmU5MDMyZGI0MjZjZTIwMjMyZmE0MTVkIiwidXNlcl9uYW1lIjoiODI5NTE3MTI5NjAzIiwic2NvcGUiOlsidXNlci4qIl0sImV4cCI6MTc0MzU3NTYxMSwiaWF0IjoxNzQzNTczODExLCJqdGkiOiJiYjIwMmJmMi1kY2JiLTQ0ZmUtODNiYy1jMzE4YzZhMTE0MTUiLCJjbGllbnRfaWQiOiJrb21vb3Qtd2ViIiwidXNlcm5hbWUiOiI4Mjk1MTcxMjk2MDMifQ.c-qLMySlZMoV_eH1G7L8BQnE1aG81rrimlSvgAPlnx8WzBNNqN1IS0ntkV3q9cETgDPz70VrdsMP6_j4j1KWfObeuxkWr7IETiOFHByL8mTwDEONSdhadge4CJiCGGiInPj3xvMeVB-vqIF67wSMlhISHvFcomOF10BY6Ex6GzMiaTma_PtVokgG8v1uusZxK9ee7t_Rs3d2vhcnY-Ogzm9bVFXn5ZZ4Lb2T2LFU9lnNO-eyf3FxJ4BEYAUdLy09PX1Qs8E5h8vNeJ8Z7kqRj5KeElGsqraDcAtsmpjpR9-q7h_8m3Io4pD9VYjpGdGhaXwC7TVnAmbeKq6Q4nXfVA%7C1743575551; _ga_R7DCLCR1RB=GS1.1.1743570861.17.1.1743574080.60.0.0; _dd_s=rum=0&expire=1743574980414'}
        for x in range(x1, x2 + 1):
            xdir = '{}{}/'.format(mainzoomdir, x)
            if not os.path.isdir(xdir):
                os.mkdir(xdir)
            for y in range(y1, y2 + 1):
                content = None
                yfilename = '{}{}.vector.pbf'.format(xdir, y)
                if os.path.isfile(yfilename):
                    with open(yfilename, 'rb') as f:
                        content = f.read()
                else:
                    url = 'https://trailview-tiles.maps.komoot.net/tiles/v2/{}/{}/{}.vector.pbf'.format(zoom, x, y)
                    response = requests.get(url)
                    if response.status_code == 200 or response.status_code == 204:
                        content = response.content
                        with open(yfilename, "wb") as f:
                            f.write(content)
                    else:
                        print('{}: response: {}'.format(url, response.status_code))
                if content:
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
        komoot_string_field = StringField.objects.get(key=DATABASE_KEY)
        komoot_string_field.value = json.dumps(points)
        komoot_string_field.save()
        update_revision(None, None)