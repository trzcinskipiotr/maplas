from rest_framework import serializers

from maplas_app.models import Track, Region, Place, PlaceType, Photo, Area

class PhotoSerializerUrlNested(serializers.ModelSerializer):
    image_fullhd = serializers.SerializerMethodField()
    image_thumb = serializers.SerializerMethodField()

    def get_image_fullhd(self, photo):
        return self.context['request'].scheme + '://' + self.context['request'].META['HTTP_HOST'] + photo.image_fullhd.url

    def get_image_thumb(self, photo):
        return self.context['request'].scheme + '://' + self.context['request'].META['HTTP_HOST'] + photo.image_thumb.url

    class Meta:
        model = Photo
        fields = ['id', 'name', 'exif_time_taken', 'org_filename', 'description', 'image', 'image_fullhd', 'image_thumb', 'private']

class RegionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Region
        fields = ['id', 'name']

class TrackSerializerRegionNested(serializers.ModelSerializer):
    photo_set = serializers.SerializerMethodField()
    region = RegionSerializer()

    def get_photo_set(self, track):
        user = self.context['request'].user
        if (user) and (user.is_authenticated):
            return PhotoSerializerUrlNested(track.photo_set, many=True, context=self.context).data
        else:
            return PhotoSerializerUrlNested(track.photo_set.filter(private=False), many=True, context=self.context).data

    class Meta:
        model = Track
        fields = ['id', 'name', 'description', 'color', 'points_json_optimized', 'status', 'type', 'start_time', 'end_time', 'distance', 'region', 'photo_set']

class TrackSerializer(serializers.ModelSerializer):

    class Meta:
        model = Track
        fields = ['id', 'name', 'description', 'color', 'points_json_optimized', 'status', 'type', 'start_time', 'end_time', 'distance', 'region', 'gpx_file', 'upload_user']

class TrackSerializerNoGpx(serializers.ModelSerializer):

    class Meta:
        model = Track
        fields = ['id', 'name', 'description', 'color', 'points_json', 'points_json_optimized', 'status', 'type', 'start_time', 'end_time', 'distance', 'region', 'upload_user']

class TrackSerializerFull(serializers.ModelSerializer):
    photo_set = serializers.SerializerMethodField()

    def get_photo_set(self, track):
        user = self.context['request'].user
        if (user) and (user.is_authenticated):
            return PhotoSerializerUrlNested(track.photo_set, many=True, context=self.context).data
        else:
            return PhotoSerializerUrlNested(track.photo_set.filter(private=False), many=True, context=self.context).data

    class Meta:
        model = Track
        fields = ['id', 'name', 'description', 'color', 'points_json_optimized', 'points_json', 'status', 'type', 'start_time', 'end_time', 'distance', 'region', 'gpx_file', 'upload_user', 'photo_set']

class PlaceTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = PlaceType
        fields = ['id', 'name']

class PhotoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Photo
        fields = ['id', 'name', 'org_filename', 'description', 'place', 'track', 'exif_lat', 'exif_lon', 'image', 'private']

class PlaceSerializerTypeNested(serializers.ModelSerializer):
    type = PlaceTypeSerializer(many=False)
    photo_set = PhotoSerializerUrlNested(many=True)

    class Meta:
        model = Place
        fields = ['id', 'name', 'description', 'lat', 'lon', 'type', 'approved', 'photo_set']

class PlaceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Place
        fields = ['id', 'name', 'description', 'lat', 'lon', 'type', 'approved']

class AreaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Area
        fields = ['id', 'name', 'description', 'points_json', 'color']

class AreaSerializerFull(serializers.ModelSerializer):

    class Meta:
        model = Area
        fields = ['id', 'name', 'description', 'points_json', 'color', 'tile_indexes']
