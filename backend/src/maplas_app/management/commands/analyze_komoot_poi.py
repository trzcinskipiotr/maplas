import json

from django.core.management.base import BaseCommand
from rest_framework.templatetags.rest_framework import highlight_code

from maplas_app.models import StringField

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
        imagesindetails = 0
        noimagesindetails = 0
        totalimages = 0
        firstandsecondphoto = 0
        highlightpoints = 0
        highlightsegments = 0
        for poi in pois:
            first_photo = False
            second_photo = False
            #print(json.dumps(poi, indent=4))
            if poi['details'] and 'images' in poi['details']:
                if len(poi['details']['images']) > 0:
                    imagesindetails += 1
                    first_photo = True
                totalimages = totalimages + len(poi['details']['images'])
            if poi['details'] and '_embedded' in poi['details'] and 'images' in poi['details']['_embedded'] and '_embedded' in poi['details']['_embedded']['images'] and 'items' in poi['details']['_embedded']['images']['_embedded']:
                if len(poi['details']['_embedded']['images']['_embedded']['items']) > 0:
                    imagesindetails += 1
                    second_photo = True
                totalimages = totalimages + len(poi['details']['_embedded']['images']['_embedded']['items'])
            if first_photo and second_photo:
                firstandsecondphoto += 1
            if 'front_image_url' in poi['feature']['properties']:
                photos += 1
            else:
                nophotos += 1
            if poi['details'] and 'type' in poi['details']:
                type = poi['details']['type']
                if type == 'highlight_point':
                    highlightpoints += 1
                if type == 'highlight_segment':
                    highlightsegments += 1
                if type != 'highlight_point' and type != 'highlight_segment':
                    print(type)
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
            if poi['id'] == '6247358aaa':
                print(json.dumps(poi, indent=4))
                if poi['details'] and 'images' in poi['details']:
                    print(len(poi['details']['images']))
                print()
        print('All: {}'.format(all))
        print('Photo: {}'.format(photos))
        print('No photo: {}'.format(nophotos))
        print('Name: {}'.format(name))
        print('Noname: {}'.format(noname))
        print('Name PL: {}'.format(name_pl))
        print('Noname PL: {}'.format(noname_pl))
        print('Numeric ID: {}'.format(numeric_id))
        print('NonNumeric ID: {}'.format(nonnumeric_id))

        print('imagesindetails: {}'.format(imagesindetails))
        print('noimagesindetails: {}'.format(noimagesindetails))
        print('totalimages: {}'.format(totalimages))
        print('firstandsecondphoto: {}'.format(firstandsecondphoto))
        print('highlightpoints: {}'.format(highlightpoints))
        print('highlightsegments: {}'.format(highlightsegments))