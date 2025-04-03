from django.core.management.base import BaseCommand

from maplas_app.models import StringField


class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument('key', type=str)
        parser.add_argument('filename', type=str)

    def handle(self, *args, **options):
        stringfield = StringField.objects.get(key=options['key'])
        with open(options['filename'], 'w') as f:
            f.write(stringfield.value)
        print('{} bytes written to {}'.format(len(stringfield.value), options['filename']))
