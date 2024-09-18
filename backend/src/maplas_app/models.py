from django.contrib.auth.models import User
from django.core.files.images import get_image_dimensions
from django.db import models
from colorfield.fields import ColorField
from django.db.models.signals import post_save
from django.dispatch import receiver
from djchoices import DjangoChoices, ChoiceItem
from django.conf import settings
import json
import datetime
import gpxpy
import exifread
import piexif
import uuid
import os
import time

from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill, Thumbnail, SmartResize, Resize, ResizeToFit

from maplas_app.gps_utils import calculate_distance_from_segments


class Region(models.Model):
    name = models.CharField(max_length=100, null=False, blank=False)
    pl = models.CharField(max_length=100, null=False, blank=False)
    en = models.CharField(max_length=100, null=False, blank=False)

    def __str__(self):
        return self.name


class Track(models.Model):

    class Type(DjangoChoices):
        car = ChoiceItem(1)
        bicycle = ChoiceItem(2)
        walk = ChoiceItem(3)
        other = ChoiceItem(4)
        mushroom = ChoiceItem(5)

    class Status(DjangoChoices):
        done = ChoiceItem(1)
        planned = ChoiceItem(2)
        trail = ChoiceItem(3)
        other_people = ChoiceItem(4)
        event = ChoiceItem(5)
        border = ChoiceItem(6)

    name = models.CharField(max_length=1000, null=False, blank=False)
    description = models.TextField(null=False, default='', blank=True)
    points_json = models.TextField(null=False, default='', blank=True)
    points_json_optimized = models.TextField(null=False, default='', blank=True)
    color = ColorField(null=True, blank=True)
    style = models.IntegerField(null=False, blank=False, default=1)
    start_time = models.DateTimeField(null=True, blank=True, db_index=True)
    end_time = models.DateTimeField(null=True, blank=True)
    distance = models.IntegerField(null=False)
    status = models.IntegerField(null=False, blank=False, choices=Status.choices)
    type = models.IntegerField(null=False, blank=False, choices=Type.choices)
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True)
    gpx_file = models.TextField(null=False, default='', blank=True)
    upload_user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)

    def get_points_json_counts(self):
        segments = 0
        points = 0
        for segment in json.loads(self.points_json):
            segments = segments + 1
            points = points + len(segment)
        return "Segments: {}, Points: {}".format(segments, points)

    def get_points_json_optimized_counts(self):
        segments = 0
        points = 0
        for segment in json.loads(self.points_json_optimized):
            segments = segments + 1
            points = points + len(segment)
        return "Segments: {}, Points: {}".format(segments, points)

    get_points_json_counts.short_description = 'points json'
    get_points_json_optimized_counts.short_description = 'points json optimized'

    def get_gpx_file_counts(self):
        segments = 0
        points = 0
        if self.gpx_file:
            gpx = gpxpy.parse(self.gpx_file)
            for track in gpx.tracks:
                for segment in track.segments:
                    segments = segments + 1
                    points = points + len(segment.points)
            return "Segments: {}, Points: {}".format(segments, points)
        else:
            return 'No file'

    get_gpx_file_counts.short_description = 'gpx file'

    def calculate_distance_from_segments(self):
        return calculate_distance_from_segments(json.loads(self.points_json))

    def calculate_distance_from_segments_optimized(self):
        return calculate_distance_from_segments(json.loads(self.points_json_optimized))

class PlaceType(models.Model):
    name = models.CharField(max_length=100, null=False, blank=False)
    icon = models.CharField(max_length=100, null=False, blank=False)
    pl = models.CharField(max_length=100, null=False, blank=False)
    en = models.CharField(max_length=100, null=False, blank=False)
    order = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class Place(models.Model):
    type = models.ForeignKey(PlaceType, null=False, on_delete=models.PROTECT)
    lat = models.FloatField(null=False, blank=False)
    lon = models.FloatField(null=False, blank=False)
    name = models.CharField(max_length=2000, null=False, default='', blank=True)
    description = models.CharField(max_length=2000, null=False, default='', blank=True)
    approved = models.BooleanField(null=False, default=True)

    class Meta:
        unique_together = ['lat', 'lon']

def _get_if_exist(data, key):
    if key in data:
        return data[key]
    return None

def _convert_to_degress(value):
    d = float(value.values[0].num) / float(value.values[0].den)
    m = float(value.values[1].num) / float(value.values[1].den)
    s = float(value.values[2].num) / float(value.values[2].den)
    return d + (m / 60.0) + (s / 3600.0)


def get_exif_location(exif_data):
    lat = None
    lon = None
    gps_latitude = _get_if_exist(exif_data, 'GPS GPSLatitude')
    gps_latitude_ref = _get_if_exist(exif_data, 'GPS GPSLatitudeRef')
    gps_longitude = _get_if_exist(exif_data, 'GPS GPSLongitude')
    gps_longitude_ref = _get_if_exist(exif_data, 'GPS GPSLongitudeRef')
    if gps_latitude and gps_latitude_ref and gps_longitude and gps_longitude_ref:
        if (gps_latitude.values[0].den != 0) and (gps_latitude.values[1].den != 0) and (gps_latitude.values[2].den != 0) and (gps_longitude.values[0].den != 0) and (gps_longitude.values[1].den != 0) and (gps_longitude.values[2].den != 0):
            lat = _convert_to_degress(gps_latitude)
            if gps_latitude_ref.values[0] != 'N':
                lat = 0 - lat
            lon = _convert_to_degress(gps_longitude)
            if gps_longitude_ref.values[0] != 'E':
                lon = 0 - lon
    return lat, lon

class Photo(models.Model):

    def get_file_path(instance, filename):
        ext = filename.split('.')[-1]
        filename = "{}.{}".format(uuid.uuid4(), ext)
        return os.path.join('photos', filename)

    private = models.BooleanField(db_index=True, null=False, default=False)
    past = models.BooleanField(db_index=True, null=False, default=False)
    order = models.IntegerField(null=True, blank=True, default=1)

    name = models.CharField(max_length=2000, null=False, default='', blank=True)
    description = models.CharField(max_length=2000, null=False, default='', blank=True)
    place = models.ForeignKey(Place, null=True, on_delete=models.CASCADE, blank=True)
    track = models.ForeignKey(Track, null=True, on_delete=models.CASCADE, blank=True)
    org_filename = models.CharField(max_length=256, null=True, blank=True)
    image = models.ImageField(upload_to=get_file_path, null=False)
    image_fullhd = ImageSpecField(source='image',
                                      processors=[ResizeToFit(1920, 1920)],
                                      format='JPEG',
                                      options={'quality': 90})
    image_thumb = ImageSpecField(source='image',
                                  processors=[ResizeToFit(300, 300)],
                                  format='JPEG',
                                  options={'quality': 80})
    exif_time_taken = models.DateTimeField(null=True, blank=True)
    exif_lat = models.FloatField(null=True, blank=True)
    exif_lon = models.FloatField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if (not self.exif_time_taken) or (not self.exif_lat) or (not self.exif_lon):
            tags = exifread.process_file(self.image, details=False)
            if 'EXIF DateTimeOriginal' in tags:
                date_time_obj = datetime.datetime.strptime(str(tags['EXIF DateTimeOriginal']), '%Y:%m:%d %H:%M:%S')
                self.exif_time_taken = date_time_obj
            lat, lon = get_exif_location(tags)
            if lat:
                self.exif_lat = round(lat, 5)
            if lon:
                self.exif_lon = round(lon, 5)
        super(Photo, self).save(*args, **kwargs)
        exif_fullhd = piexif.load(self.image.path)
        if '0th' in exif_fullhd:
            width, height = get_image_dimensions(self.image_fullhd.file)
            exif_fullhd['0th'][256] = width
            exif_fullhd['0th'][257] = height
        if '1st' in exif_fullhd:
            del exif_fullhd['1st']
        if 'thumbnail' in exif_fullhd:
            del exif_fullhd['thumbnail']
        # Fix S10 Mini photos
        if ('Exif' in exif_fullhd) and (41729 in exif_fullhd['Exif']):
            del exif_fullhd['Exif'][41729]
        exif_thumb = piexif.load(self.image.path)
        if '0th' in exif_thumb:
            width, height = get_image_dimensions(self.image_thumb.file)
            exif_thumb['0th'][256] = width
            exif_thumb['0th'][257] = height
        if '1st' in exif_thumb:
            del exif_thumb['1st']
        if 'thumbnail' in exif_thumb:
            del exif_thumb['thumbnail']
        # Fix S10 Mini photos
        if ('Exif' in exif_thumb) and (41729 in exif_thumb['Exif']):
            del exif_thumb['Exif'][41729]
        piexif.insert(piexif.dump(exif_fullhd), self.image_fullhd.path)
        piexif.insert(piexif.dump(exif_thumb), self.image_thumb.path)

    class Meta:
        ordering = ['order', 'id']

def delete_file(image):
    if image and image.path and os.path.isfile(image.path):
        os.remove(image.path)

@receiver(models.signals.post_delete, sender=Photo)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    delete_file(instance.image)
    delete_file(instance.image_thumb)
    delete_file(instance.image_fullhd)

class Area(models.Model):
    name = models.CharField(max_length=1000, null=False, blank=False)
    description = models.TextField(null=False, default='', blank=True)
    points_json = models.TextField(null=False, default='', blank=True)
    color = ColorField(null=True, blank=True)
    tile_indexes = models.TextField(null=False, default='', blank=True)

class MapLayer(models.Model):
    is_active = models.BooleanField(null=False, blank=True, default=True)
    order = models.IntegerField(null=False, blank=False)
    dict_key = models.CharField(max_length=100, null=False, blank=False)
    display_name = models.CharField(max_length=100, null=False, blank=False)
    javascript_code = models.TextField(null=False, blank=False)

class VideoLink(models.Model):
    name = models.CharField(max_length=1000, null=False, blank=False)
    description = models.TextField(null=False, default='', blank=True)
    link = models.CharField(max_length=1000, null=False, default='', blank=True)
    html = models.TextField(null=False, blank=False)
    track = models.ForeignKey(Track, null=True, on_delete=models.CASCADE, blank=True)
    place = models.ForeignKey(Place, null=True, on_delete=models.CASCADE, blank=True)

class StringField(models.Model):
    key = models.CharField(max_length=1000, db_index=True, null=False)
    value = models.TextField(null=False, blank=True)

class GpsPoint(models.Model):
    created = models.DateTimeField(null=False, blank=False, auto_now_add=True)
    lat = models.FloatField(null=False, blank=False)
    lon = models.FloatField(null=False, blank=False)
    time = models.DateTimeField(null=False, blank=False, db_index=True)
    name = models.CharField(max_length=1000, null=False)

@receiver(models.signals.post_save, sender=Area)
@receiver(models.signals.post_save, sender=MapLayer)
@receiver(models.signals.post_save, sender=VideoLink)
@receiver(models.signals.post_save, sender=Photo)
@receiver(models.signals.post_save, sender=Place)
@receiver(models.signals.post_save, sender=PlaceType)
@receiver(models.signals.post_save, sender=Track)
@receiver(models.signals.post_save, sender=Region)
@receiver(models.signals.post_delete, sender=Area)
@receiver(models.signals.post_delete, sender=MapLayer)
@receiver(models.signals.post_delete, sender=VideoLink)
@receiver(models.signals.post_delete, sender=Photo)
@receiver(models.signals.post_delete, sender=Place)
@receiver(models.signals.post_delete, sender=PlaceType)
@receiver(models.signals.post_delete, sender=Track)
@receiver(models.signals.post_delete, sender=Region)
def update_revision(sender, instance, **kwargs):
    field = StringField.objects.filter(key=settings.DATA_REVISION_KEY).first()
    if field:
        field.value = '{}'.format(time.time_ns())
        field.save()