from django.core.management.base import BaseCommand

from maplas_app import utils

class Command(BaseCommand):

    def add_arguments(self, parser):
        parser.add_argument('gpx_file', type=str)

    def handle(self, *args, **options):
        utils.create_track_from_gpx_file(options['gpx_file'])
