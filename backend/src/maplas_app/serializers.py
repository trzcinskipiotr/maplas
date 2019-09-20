from rest_framework import serializers

from maplas_app.models import Track, Place

class PlaceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Place
        fields = ['id', 'name']

class TrackSerializerPlaceNested(serializers.ModelSerializer):
    place = PlaceSerializer()

    class Meta:
        model = Track
        fields = ['id', 'name', 'description', 'color', 'points_json_optimized', 'status', 'type', 'start_time', 'end_time', 'distance', 'place']

class TrackSerializer(serializers.ModelSerializer):

    class Meta:
        model = Track
        fields = ['id', 'name', 'description', 'color', 'points_json_optimized', 'status', 'type', 'start_time', 'end_time', 'distance', 'place', 'gpx_file', 'upload_user']
