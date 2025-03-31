import json
import sys
import time
from wsgiref import headers

import requests
import geopandas
from vt2geojson.tools import vt_bytes_to_geojson

from django.core.management.base import BaseCommand
import os

from maplas_app.models import StringField, update_revision


class Command(BaseCommand):

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
        image_headers = {'Cookie': 'kmt_rid=0058db9f5edf3a8601f1a1842cabcb4e3e05e982a3d9137aca; _ga=GA1.1.369933700.1739791813; _hjSessionUser_5024555=eyJpZCI6ImMxM2ZjMTdkLTk3YWEtNTFlMy04ZmUzLTdlOGU0YTAxOTQwZSIsImNyZWF0ZWQiOjE3Mzk3OTE4MTI2ODQsImV4aXN0aW5nIjp0cnVlfQ==; __stripe_mid=e72a2b5f-5664-4227-a392-2cfc3eee6299d1a6f0; koa_re=1774954320; koa_rt=829517129603%7C%2F829517129603%2Fkomoot-web%2F4fec6016-a586-4807-a2b4-efdef78d02b0%7C1774954320; koa_ae=1743420060; koa_at=829517129603%7CeyJ4NXQjUzI1NiI6InlIQ2xZdUdwWlNvU2c3dkhrT1k4YzYyR2NGdGxSeV9neEpIYkJfNFpjamsiLCJraWQiOiJqd3QtMjAyNTAyMTEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJydGkiOiJhOGNlMTU5MzQ4YzQzMTkxMmE0NmYzMGYzOGI0MDA1ZGQ2YTYzNDVhYmU5MDMyZGI0MjZjZTIwMjMyZmE0MTVkIiwidXNlcl9uYW1lIjoiODI5NTE3MTI5NjAzIiwic2NvcGUiOlsidXNlci4qIl0sImV4cCI6MTc0MzQyMDEyMCwiaWF0IjoxNzQzNDE4MzIwLCJqdGkiOiJhMTc4YjQxMS01NTJkLTQxYWQtYjQyMS1lYzBlNGYyYTA3YTMiLCJjbGllbnRfaWQiOiJrb21vb3Qtd2ViIiwidXNlcm5hbWUiOiI4Mjk1MTcxMjk2MDMifQ.Y_jHBiqib8nBpPt0J6LEyyZk7A_HRcFEY0JQzXk4bUeKRaRDMsVL5yAl_gfmt-vYD1INcUllCOD8xWaaGJa1yfDFLqcO1gD7oK8q-LH6Vd2lxo1HoEfv5uB3ejgKBNP08EUxPS63lQDfX-LBMNhwtL9griOqKHLhghrmHM7scFb0NzhQ0Y775FzrP6WbluAWxhHCZ1oIFf2yxtXq4v_hoQCmQayM3sxWf-byeBbw1dIB42ywXfdijVkQszJ2TqkDQO-mpJLKHINi3fWEnAZw9p3HqlRwzN5oA9js9u_TkTrLXWpgfYjoXvBEBTmXz6lhdDiOUEVyPJwo0YXot7QsVQ%7C1743420060; kmt_sess=eyJsYW5nIjoiZGUiLCJtZXRyaWMiOm51bGwsInByb2ZpbGUiOnsidXNlcm5hbWUiOiI4Mjk1MTcxMjk2MDMiLCJsb2NhbGUiOiJwbF9QTCIsIm1ldHJpYyI6dHJ1ZX19; kmt_sess.sig=qiGE3JRx7Mi1GXrmPf-5Hrjt3yA; _ga_R7DCLCR1RB=GS1.1.1743414877.9.1.1743418642.54.0.0; _dd_s=rum=0&expire=1743419540576'}
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
                        if 15.429219410049257 < lon and lon < 16.982791054412257:
                            if 52.60444531811852 < lat and lat < 52.87802190438727:
                                id = feature['properties']['trailview_id']
                                point = {'id': id, 'lat': lat, 'lon': lon, 'photo': ''}
                                points.append(point)
                                if lat < min_lat:
                                    min_lat = lat
                                if lat > max_lat:
                                    max_lat = lat
                                if lon < min_lon:
                                    min_lon = lon
                                if lon > max_lon:
                                    max_lon = lon
                                image_url = 'https://www.komoot.com/api/trailview/v1/images/{}?hl=pl'.format(id)
                                print(image_url)
                                response_image = requests.get(image_url, headers=image_headers)
                                print(response_image.status_code)
                                response_image_json = response_image.json()
                                photo_link = response_image_json['image']['src']
                                point['photo'] = photo_link.split('?')[0]
                                time.sleep(0.3)
                                processed += 1
                                print(processed)
                else:
                    print('{}: response: {}'.format(url, response.status_code))
        print(len(points))
        print('LON: {} {}'.format(min_lon, max_lon))
        print('LAT: {} {}'.format(min_lat, max_lat))
        komoot_string_field = StringField.objects.get(key='KOMOOTTRAILVIEW')
        komoot_string_field.value = json.dumps(points)
        komoot_string_field.save()
        update_revision(None, None)
