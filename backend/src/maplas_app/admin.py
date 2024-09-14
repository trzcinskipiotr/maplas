from django.contrib import admin
from imagekit.admin import AdminThumbnail

from maplas_app.models import Track, Region, Place, PlaceType, Photo, Area, MapLayer, VideoLink, StringField


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'color', 'start_time', 'end_time', 'distance', 'status', 'type', 'upload_user')
    search_fields = ('id', 'name', 'description', 'color', 'points_json')

@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'pl', 'en')
    search_fields = ('id', 'name', 'pl', 'en')

class TrackDetails(Track):
    class Meta:
        proxy = True

@admin.register(TrackDetails)
class TrackDetailsAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'color', 'start_time', 'end_time', 'distance', 'status', 'type', 'get_points_json_counts', 'get_points_json_optimized_counts', 'get_gpx_file_counts', 'upload_user')
    search_fields = ('id', 'name', 'description', 'color', 'points_json')

@admin.register(PlaceType)
class PlaceTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'icon', 'pl', 'en', 'order')
    search_fields = ('id', 'name', 'icon', 'pl', 'en')

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'lat', 'lon', 'type', 'approved')
    search_fields = ('id', 'name', 'description')

@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'org_filename', 'exif_time_taken', 'exif_lat', 'exif_lon', 'place', 'track', 'image', 'image_fullhd', 'image_thumb', 'private', 'order', 'past')
    admin_thumbnail = AdminThumbnail(image_field='image')
    search_fields = ('id', 'name', 'description', 'place__name')
    readonly_fields = ('image',)

@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'points_json', 'color')
    search_fields = ('id', 'name', 'description')

@admin.register(MapLayer)
class MapLayerAdmin(admin.ModelAdmin):
    list_display = ('id', 'is_active', 'order', 'dict_key', 'display_name', 'javascript_code')
    search_fields = ('dict_key', 'display_name', 'javascript_code')

@admin.register(VideoLink)
class VideoLinkAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'link', 'html', 'track', 'place')
    search_fields = ('name', 'description', 'link', 'html')

@admin.register(StringField)
class StringFieldAdmin(admin.ModelAdmin):
    list_display = ('id', 'key', 'value')
    search_fields = ('key', 'value')