from django.contrib import admin

from maplas_app.models import Track


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'color', 'points_json')
    search_fields = ('id', 'name', 'color', 'points_json')

