from rest_framework import serializers

from maplas_app.models import Track, Region, Place, PlaceType, Photo


class RegionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Region
        fields = ['id', 'name']

class TrackSerializerRegionNested(serializers.ModelSerializer):
    region = RegionSerializer()

    class Meta:
        model = Track
        fields = ['id', 'name', 'description', 'color', 'points_json_optimized', 'status', 'type', 'start_time', 'end_time', 'distance', 'region']

class TrackSerializer(serializers.ModelSerializer):

    class Meta:
        model = Track
        fields = ['id', 'name', 'description', 'color', 'points_json_optimized', 'status', 'type', 'start_time', 'end_time', 'distance', 'region', 'gpx_file', 'upload_user']

class TrackSerializerFull(serializers.ModelSerializer):

    class Meta:
        model = Track
        fields = ['id', 'name', 'description', 'color', 'points_json_optimized', 'points_json', 'status', 'type', 'start_time', 'end_time', 'distance', 'region', 'gpx_file', 'upload_user']

class PlaceTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = PlaceType
        fields = ['id', 'name']

class PhotoSerializerUrlNested(serializers.ModelSerializer):
    image_fullhd = serializers.SerializerMethodField()
    image_thumb = serializers.SerializerMethodField()

    def get_image_fullhd(self, photo):
        return self.context['request'].scheme + '://' + self.context['request'].META['HTTP_HOST'] + photo.image_fullhd.url

    def get_image_thumb(self, photo):
        return self.context['request'].scheme + '://' + self.context['request'].META['HTTP_HOST'] + photo.image_thumb.url

    class Meta:
        model = Photo
        fields = ['id', 'name', 'description', 'image', 'image_fullhd', 'image_thumb']

class PhotoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Photo
        fields = ['id', 'name', 'description', 'place', 'image']

class PlaceSerializerTypeNested(serializers.ModelSerializer):
    type = PlaceTypeSerializer(many=False)
    photo_set = PhotoSerializerUrlNested(many=True)

    class Meta:
        model = Place
        fields = ['id', 'name', 'description', 'lat', 'lon', 'type', 'photo_set']

class PlaceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Place
        fields = ['id', 'name', 'description', 'lat', 'lon', 'type']
