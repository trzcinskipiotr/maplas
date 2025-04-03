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

        x1 = 551
        x2 = 581
        y1 = 326
        y2 = 351
        zoom = 10

        x1 = 1103
        x2 = 1163
        y1 = 652
        y2 = 703
        zoom = 11

        x1 = 2207
        x2 = 2326
        y1 = 1305
        y2 = 1406
        zoom = 12

        zoom = 13
        x1tmp, y1tmp = gps2tile(POLAND[0][0], POLAND[0][1], zoom)
        x2tmp, y2tmp = gps2tile(POLAND[1][0], POLAND[1][1], zoom)
        x1 = min(x1tmp, x2tmp)
        x2 = max(x1tmp, x2tmp)
        y1 = min(y1tmp, y2tmp)
        y2 = max(y1tmp, y2tmp)
        print(x1, y1, x2, y2)
        print((x2-x1+1)*(y2-y1+1))

        DATABASE_KEY='KOMOOTPOI_{}'.format(zoom)
        if StringField.objects.filter(key=DATABASE_KEY).count() == 0:
            StringField.objects.create(key=DATABASE_KEY, value='[]')

        downloaded = 0
        maindir = '/Users/piotr.trzcinski/KOMOOTPOI/'
        if not os.path.isdir(maindir):
            os.mkdir(maindir)
        mainzoomdir = '{}{}/'.format(maindir, zoom)
        if not os.path.isdir(maindir):
            os.mkdir(mainzoomdir)
        points = []
        min_lat = 2000
        max_lat = -2000
        min_lon = 2000
        max_lon = -2000
        processed = 0
        details_downloaded = 0
        komoot_string_field = StringField.objects.get(key=DATABASE_KEY)
        db_object = json.loads(komoot_string_field.value)
        db_object_dict = {}
        for item in db_object:
            db_object_dict[item['id']] = item
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
                    url = 'https://b.tiles-api.maps.komoot.net/v1/tiles/poi/{}/{}/{}.vector.pbf?cache-version=1'.format(zoom, x, y)
                    downloaded += 1
                    print(downloaded)
                    response = requests.get(url)
                    if response.status_code == 200:
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
                            id = feature['properties']['id']
                            if id in db_object_dict:
                                point = db_object_dict[id]
                                processed += 1
                            else:
                                point = {'id': id, 'lat': lat, 'lon': lon, 'photo': None, 'feature': feature, 'details': None}
                                photo_link = feature['properties']['front_image_url'] if 'front_image_url' in feature['properties'] else None
                                if photo_link:
                                    point['photo'] = photo_link.split('?')[0]
                                processed += 1
                            if not 'details' in point or not point['details']:
                                if details_downloaded <= 1000:
                                    if point['id'].isnumeric():
                                        details_url = 'https://www.komoot.com/api/v007/highlights/{}?_embedded=coordinates%2Cimages%2Ctips%2Crecommenders%2Cbookmark&_embedded.tips=rating&_embedded.images=rating'.format(point['id'])
                                        headers = {}
                                    else:
                                        details_url = 'https://www.komoot.com/api/v007/pois/{}?_embedded=saved%2Cexternal_reviews&username=829517129603&hl=pl'.format(point['id'])
                                        headers = {'Cookie': 'kmt_rid=0058db9f5edf3a8601f1a1842cabcb4e3e05e982a3d9137aca; _ga=GA1.1.369933700.1739791813; _hjSessionUser_5024555=eyJpZCI6ImMxM2ZjMTdkLTk3YWEtNTFlMy04ZmUzLTdlOGU0YTAxOTQwZSIsImNyZWF0ZWQiOjE3Mzk3OTE4MTI2ODQsImV4aXN0aW5nIjp0cnVlfQ==; __stripe_mid=e72a2b5f-5664-4227-a392-2cfc3eee6299d1a6f0; koa_re=1775106860; koa_rt=829517129603%7C%2F829517129603%2Fkomoot-web%2F4fec6016-a586-4807-a2b4-efdef78d02b0%7C1775106860; koa_ae=1743572600; koa_at=829517129603%7CeyJ4NXQjUzI1NiI6InlIQ2xZdUdwWlNvU2c3dkhrT1k4YzYyR2NGdGxSeV9neEpIYkJfNFpjamsiLCJraWQiOiJqd3QtMjAyNTAyMTEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJydGkiOiJhOGNlMTU5MzQ4YzQzMTkxMmE0NmYzMGYzOGI0MDA1ZGQ2YTYzNDVhYmU5MDMyZGI0MjZjZTIwMjMyZmE0MTVkIiwidXNlcl9uYW1lIjoiODI5NTE3MTI5NjAzIiwic2NvcGUiOlsidXNlci4qIl0sImV4cCI6MTc0MzU3MjY2MCwiaWF0IjoxNzQzNTcwODYwLCJqdGkiOiI5OTA3ZDNiMS1lMGZiLTRlOTgtODU5Zi1lN2Y3NjI3NDIxZWEiLCJjbGllbnRfaWQiOiJrb21vb3Qtd2ViIiwidXNlcm5hbWUiOiI4Mjk1MTcxMjk2MDMifQ.sebOGQskeC37EbppaQTUMWsYF9ozRuw3dGlIHyS5o9cYlJGIee8POcR3sEu9fOY3xAuWpKjSLfIL2lKn9a_G0-2WmAqZMfCSFjK_WOgKBkHuHfTT5-Zs52SzXavnEUGZrhODQHgRrCakYWbGf3aNNQnOom37g1vaGK5FaXfY3tQ9YuuSo8hS-4LczTN00_N6TfZmgEhpUR-ySX4H3D4z7KLCkmOHapI7fLTsnfJy6zcNJMAqz3CSaCHYod6bYQT2aoMN3YpG1uHfhkd2OarhJfUSkE_U8lqS3WFlhgTZkuCahm03GrJLCKa4SfVgApg5CaAAeCoHqcLELdC7D-rkcA%7C1743572600; kmt_sess=eyJsYW5nIjoicGwiLCJtZXRyaWMiOnRydWUsInByb2ZpbGUiOnsidXNlcm5hbWUiOiI4Mjk1MTcxMjk2MDMiLCJsb2NhbGUiOiJwbF9QTCIsIm1ldHJpYyI6dHJ1ZX19; kmt_sess.sig=rTVdDTdrnsWkcjIM3bHW-3So0jM; _ga_R7DCLCR1RB=GS1.1.1743570861.17.1.1743572227.59.0.0; _dd_s=rum=0&expire=1743573126740'}
                                    response_details = requests.get(details_url, headers=headers)
                                    if response_details.status_code == 200:
                                        response_details_json = response_details.json()
                                        point['details'] = response_details_json
                                        time.sleep(0.1)
                                        details_downloaded += 1
                                        print(details_downloaded)
                                    else:
                                        print('{}: response: {}'.format(details_url, response_details.status_code))
                            points.append(point)
        print(len(points))
        for point in points:
            break
            if point['photo']:
                id = point['id']
                filename = '{}{}.jpg'.format(settings.KOMOOT_POI_IMG, id)
                thumb_filename = '{}{}_thumb.jpg'.format(settings.KOMOOT_POI_IMG, id)
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