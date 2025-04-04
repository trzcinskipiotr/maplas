import os
import time
import requests

from django.core.management.base import BaseCommand
from django.conf import settings

from maplas_app.gps_utils import gps2tile512, gps2tile

PUSZCZA_NOTECKA = [[52.60444, 15.42921], [52.87802, 16.98279]]
PUSZCZA_BYDGOSKA = [[52.83056, 17.88215], [53.11460, 18.75272]]
BORY1 = [[53.44593, 16.79063], [54.14647, 18.74028]]

POLAND = [[49, 14], [54.5, 24.1]]
NORTH_WEST_POLAND = [[52.33, 14.68], [54.34, 19.13]]

AREAS_TO_IMPORT = [PUSZCZA_NOTECKA, PUSZCZA_BYDGOSKA, BORY1]

class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument('zoom_min', type=int, choices=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
        parser.add_argument('zoom_max', type=int, choices=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])

    def handle(self, *args, **options):
        maindir = settings.STRAVA_HEATMAP_TILE_DIR
        if not os.path.isdir(maindir):
            os.mkdir(maindir)
        for zoom in range(options['zoom_min'], options['zoom_max'] +1 ):
            if zoom <= 11:
                AREA_TO_DOWNLOAD = POLAND
            else:
                AREA_TO_DOWNLOAD = NORTH_WEST_POLAND
            mainzoomdir = '{}{}/'.format(maindir, zoom)
            if not os.path.isdir(mainzoomdir):
                os.mkdir(mainzoomdir)
            x1tmp, y1tmp = gps2tile(AREA_TO_DOWNLOAD[0][0], AREA_TO_DOWNLOAD[0][1], zoom)
            x2tmp, y2tmp = gps2tile(AREA_TO_DOWNLOAD[1][0], AREA_TO_DOWNLOAD[1][1], zoom)
            x1 = min(x1tmp, x2tmp)
            x2 = max(x1tmp, x2tmp)
            y1 = min(y1tmp, y2tmp)
            y2 = max(y1tmp, y2tmp)
            print('X=[{}-{}], Y=[{}-{}]'.format(x1, x2, y1, y2))
            tiles_to_process = (x2 - x1 + 1) * (y2 - y1 + 1)
            print('Tiles to process: {}'.format(tiles_to_process))
            time.sleep(2)

            tiles_to_download = 0
            tiles_downloaded_ok = 0
            tiles_download_404 = 0
            tiles_download_failed = 0
            tiles_from_cache = 0

            exit_x = False
            for x in range(x1, x2 + 1):
                xdir = '{}{}/'.format(mainzoomdir, x)
                if not os.path.isdir(xdir):
                    os.mkdir(xdir)
                for y in range(y1, y2 + 1):
                    yfilename = '{}{}.png'.format(xdir, y)
                    if os.path.isfile(yfilename):
                        tiles_from_cache += 1
                    else:
                        tiles_to_download += 1
                        headers = {'Cookie': 'sp=b66ba8f3-a822-4d95-9e0e-a0b64c40504c; _gcl_au=1.1.1141109133.1742740658; _scid=G-iZzceDAKxWXoIQJ5yqv-p9VUaSwTF04oS3BA; _fbp=fb.1.1742740657949.135716985251527779; _ga=GA1.1.2077314359.1742740658; _tt_enable_cookie=1; _ttp=01JQ1Q060WTXS35H4PGH9EPHN4_.tt.1; _strava4_session=mbvhrtd6iqundaojo42ml82t8jhgn57e; _scid_r=HOiZzceDAKxWXoIQJ5yqv-p9VUaSwTF04oS3BQ; _ScCbts=%5B%5D; CloudFront-Key-Pair-Id=K3VK9UFQYD04PI; CloudFront-Policy=eyJTdGF0ZW1lbnQiOiBbeyJSZXNvdXJjZSI6Imh0dHBzOi8vKmNvbnRlbnQtKi5zdHJhdmEuY29tL2lkZW50aWZpZWQvKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc0Mzg2Mjg5MH19fV19; CloudFront-Signature=pLamfqaVh-w~~DvpmWojIoALAZaNLHObGtkKaupBKOSjH-NFKAO9l90BKdU7KKDoxRcSH33GPtraiy~hbNy755rYlLmCazZZ-7ik71EQfqgaMTCdp5hHHq1S5Vj82kHYAsQ9P73H~hxAr2jNIn3BnG7d37bCo5MY1CEQX8qNs816eRdq8RmubvVhfCOU7tqpA-q6nOR8A7m98-SHRaKbrrMWuJAPWdaD13iri0uIB5GbQwG43emAjVxzaOENOb4VLAoD4gbCJS913dUXG5BNUo-LmSbsIbkzsw7f3WzWEhZaN0vruuZ-AjrAirBYS01~U2LEDnMLKG9-4L~byRK~GQ__; _strava_idcf=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3NDM4NjI4OTAsImlhdCI6MTc0Mzc3NjQ5MCwiYXRobGV0ZUlkIjo0NDM4NTE5MiwidGltZXN0YW1wIjoxNzQzNzc2NDkwfQ.pM4hXwsw9Kb7C64Ld7ktgoxNWAni0nhjpqGBuWV9jno; _strava_CloudFront-Expires=1743862890000; _ga_12345=GS1.1.1743776491.2.0.1743776491.0.0.1040014264; _ga_ESZ0QKJW56=GS1.1.1743776488.2.0.1743776491.57.0.0'}
                        url = 'https://content-a.strava.com/identified/globalheat/ride/blue/{}/{}/{}.png?v=19'.format(zoom, x, y)
                        try:
                            response = requests.get(url, headers=headers)
                            if response.status_code == 200 or response.status_code == 204:
                                tiles_downloaded_ok += 1
                                content = response.content
                                with open(yfilename, "wb") as f:
                                    f.write(content)
                            else:
                                if response.status_code == 404:
                                    tiles_download_404 += 1
                                else:
                                    tiles_download_failed += 1
                                    print('{}: response: {}'.format(url, response.status_code))
                        except Exception:
                            tiles_download_failed += 1
                            print('Error connecting to: {}'.format(url))
                            time.sleep(1)
                    if tiles_download_failed > 1000:
                        exit_x = True
                        break
                if exit_x:
                    break

            print()
            print('Tiles to process: {}'.format(tiles_to_process))
            print('Tiles loaded from cache: {}'.format(tiles_from_cache))
            print('Tiles to download: {}'.format(tiles_to_download))
            print('Tiles downloaded OK: {}'.format(tiles_downloaded_ok))
            print('Tiles download 404: {}'.format(tiles_download_404))
            print('Tiles download failed: {}'.format(tiles_download_failed))
            print()
            print()