import os
import time
import requests

from django.core.management.base import BaseCommand
from django.conf import settings

from PIL import Image

class Command(BaseCommand):

    def handle(self, *args, **options):
        url = 'https://czaswlas.pl/_ajax/get_map_locations.php'
        headers = {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        raw_data = 'search=1&s_parkingi=1&s_biwaki=1&s_inne=1&s_nazwa=&map_bound_lat_max=56.74123921532039&map_bound_lng_max=80.83534240722658&map_bound_lat_min=46.60487478220968&map_bound_lng_min=-31.66465759277344&map_zoom=5&show_all_markers=0'
        response = requests.post(url, headers=headers, data=raw_data)
        if response.status_code == 200:
            response_json = response.json()
            urls = []
            for poi in response_json:
                for picture in poi['pictures']:
                    url = 'https://czaswlas.pl' + picture.replace('_mini_320x169', '_mini_gallery')
                    urls.append(url)
            downloaded = 0
            for url in urls:
                if len(url.split('/')[-1].split('.')) == 2:
                    short_filename = url.split('/')[-1].split('.')[0]
                    extension = url.split('/')[-1].split('.')[1]
                    filename = '{}{}.{}'.format(settings.CZASWLAS_IMG, short_filename, extension)
                    thumb_filename = '{}{}_thumb.{}'.format(settings.CZASWLAS_IMG, short_filename, extension)
                    if not os.path.isfile(filename):
                        response_image = requests.get(url)
                        if response_image.status_code == 200:
                            with open(filename, "wb") as f:
                                f.write(response_image.content)
                                time.sleep(0.1)
                                downloaded += 1
                                print(downloaded)
                        else:
                            print('Wrong status code from {}: {}'.format(url, response_image.status_code))
                    if os.path.isfile(filename) and not os.path.isfile(thumb_filename):
                        image = Image.open(filename)
                        image.thumbnail((300, 300))
                        image.save(thumb_filename)
                else:
                    print('Wrong url format: {}'.format(url))
        else:
            print('Wrong status code from czaswlas.pl: {}'.format(response.status_code))