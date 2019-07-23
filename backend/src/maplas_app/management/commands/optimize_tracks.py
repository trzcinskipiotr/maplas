from django.core.management.base import BaseCommand

from maplas_app import utils

class Command(BaseCommand):

    def handle(self, *args, **options):
        utils.optimize_tracks()
