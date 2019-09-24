from django.contrib import admin

from maplas_app.models import Track, Place


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'color', 'start_time', 'end_time', 'distance', 'status', 'type', 'get_points_json_counts', 'get_points_json_optimized_counts', 'get_gpx_file_counts')
    search_fields = ('id', 'name', 'description', 'color', 'points_json')

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('id', 'name')

