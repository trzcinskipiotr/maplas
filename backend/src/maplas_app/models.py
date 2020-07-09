from django.contrib.auth.models import User
from django.core.files.images import get_image_dimensions
from django.db import models
from colorfield.fields import ColorField
from django.db.models.signals import post_save
from django.dispatch import receiver
from djchoices import DjangoChoices, ChoiceItem
import json
import datetime
import gpxpy
import exifread
import piexif
import uuid
import os

from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill, Thumbnail, SmartResize, Resize, ResizeToFit


class Region(models.Model):
    name = models.CharField(max_length=100, null=False, blank=False)

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

    name = models.CharField(max_length=1000, null=False, blank=False)
    description = models.TextField(null=False, default='', blank=True)
    points_json = models.TextField(null=False, default='', blank=True)
    points_json_optimized = models.TextField(null=False, default='', blank=True)
    color = ColorField(null=True, blank=True)
    start_time = models.DateTimeField(null=True, blank=True, db_index=True)
    end_time = models.DateTimeField(null=True, blank=True)
    distance = models.IntegerField(null=False)
    status = models.IntegerField(null=False, blank=False)
    type = models.IntegerField(null=False, blank=False)
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

class PlaceType(models.Model):
    name = models.CharField(max_length=100, null=False, blank=False)

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


class Photo(models.Model):

    def get_file_path(instance, filename):
        ext = filename.split('.')[-1]
        filename = "{}.{}".format(uuid.uuid4(), ext)
        return os.path.join('photos', filename)

    name = models.CharField(max_length=2000, null=False, default='', blank=True)
    description = models.CharField(max_length=2000, null=False, default='', blank=True)
    place = models.ForeignKey(Place, null=False, on_delete=models.CASCADE)
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

    def save(self, *args, **kwargs):
        if not self.exif_time_taken:
            tags = exifread.process_file(self.image, details=False)
            if 'EXIF DateTimeOriginal' in tags:
                date_time_obj = datetime.datetime.strptime(str(tags['EXIF DateTimeOriginal']), '%Y:%m:%d %H:%M:%S')
                self.exif_time_taken = date_time_obj
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
        exif_thumb = piexif.load(self.image.path)
        if '0th' in exif_thumb:
            width, height = get_image_dimensions(self.image_thumb.file)
            exif_thumb['0th'][256] = width
            exif_thumb['0th'][257] = height
        if '1st' in exif_thumb:
            del exif_thumb['1st']
        if 'thumbnail' in exif_thumb:
            del exif_thumb['thumbnail']
        piexif.insert(piexif.dump(exif_fullhd), self.image_fullhd.path)
        piexif.insert(piexif.dump(exif_thumb), self.image_thumb.path)

def delete_file(image):
    if image and image.path and os.path.isfile(image.path):
        os.remove(image.path)

@receiver(models.signals.post_delete, sender=Photo)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    delete_file(instance.image)
    delete_file(instance.image_thumb)
    delete_file(instance.image_fullhd)
