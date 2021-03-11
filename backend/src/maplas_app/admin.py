from django.contrib import admin
from imagekit.admin import AdminThumbnail

from maplas_app.models import Track, Region, Place, PlaceType, Photo, Area


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'color', 'start_time', 'end_time', 'distance', 'status', 'type', 'upload_user')
    search_fields = ('id', 'name', 'description', 'color', 'points_json')

@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('id', 'name')

class TrackDetails(Track):
    class Meta:
        proxy = True

@admin.register(TrackDetails)
class TrackDetailsAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'color', 'start_time', 'end_time', 'distance', 'status', 'type', 'get_points_json_counts', 'get_points_json_optimized_counts', 'get_gpx_file_counts', 'upload_user')
    search_fields = ('id', 'name', 'description', 'color', 'points_json')

@admin.register(PlaceType)
class PlaceTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'lat', 'lon', 'type', 'approved')
    search_fields = ('id', 'name', 'description')

@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'org_filename', 'exif_time_taken', 'exif_lat', 'exif_lon', 'place', 'track', 'image', 'image_fullhd', 'image_thumb', 'private')
    admin_thumbnail = AdminThumbnail(image_field='image')
    search_fields = ('id', 'name', 'description', 'place__name')
    readonly_fields = ('image',)

@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'points_json', 'color')
    search_fields = ('id', 'name', 'description')
