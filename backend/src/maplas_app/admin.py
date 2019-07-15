from django.contrib import admin

from maplas_app.models import Track


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'color', 'start_time', 'end_time', 'distance', 'status', 'type')
    search_fields = ('id', 'name', 'description', 'color', 'points_json')

