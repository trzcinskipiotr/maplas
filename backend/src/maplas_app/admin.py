from django.contrib import admin

from maplas_app.models import Track


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'points_json')
    search_fields = ('id', 'name', 'points_json')

