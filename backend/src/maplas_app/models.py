from django.db import models
from colorfield.fields import ColorField

class Track(models.Model):
    name = models.CharField(max_length=1000, null=False, blank=False)
    points_json = models.TextField(null=False, blank=False)
    color = ColorField(null=True, blank=True)
