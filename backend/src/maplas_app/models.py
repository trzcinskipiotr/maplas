from django.db import models
from colorfield.fields import ColorField
from djchoices import DjangoChoices, ChoiceItem

class Place(models.Model):
    name = models.CharField(max_length=100, null=False, blank=True, default='')

    def __str__(self):
        return self.name

class Track(models.Model):

    class Type(DjangoChoices):
        car = ChoiceItem(1)
        bicycle = ChoiceItem(2)
        walk = ChoiceItem(3)
        other = ChoiceItem(4)

    class Status(DjangoChoices):
        done = ChoiceItem(1)
        planned = ChoiceItem(2)

    name = models.CharField(max_length=1000, null=False, blank=False)
    description = models.TextField(null=False, default='', blank=True)
    points_json = models.TextField(null=False, blank=False)
    points_json_optimized = models.TextField(null=False, blank=False)
    color = ColorField(null=True, blank=True)
    start_time = models.DateTimeField(null=True, blank=True, db_index=True)
    end_time = models.DateTimeField(null=True, blank=True)
    distance = models.IntegerField(null=False)
    status = models.IntegerField(null=False, blank=False)
    type = models.IntegerField(null=False, blank=False)
    place = models.ForeignKey(Place, on_delete=models.SET_NULL, null=True)
