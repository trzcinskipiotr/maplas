from rest_framework import serializers

from maplas_app.models import Track, Region, Place, PlaceType, Photo, Area, MapLayer, VideoLink, GpsPoint, PlaceTypeGroup

class VideoLinkSerializer(serializers.ModelSerializer):

    class Meta:
        model = VideoLink
        fields = ['id', 'name', 'description', 'link', 'html']

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
        fields = ['id', 'name', 'pl', 'en']

class TrackSerializerRegionNested(serializers.ModelSerializer):
    photo_set = serializers.SerializerMethodField()
    region = RegionSerializer()
    videolink_set = VideoLinkSerializer(many=True)

    def get_photo_set(self, track):
        user = self.context['request'].user
        if (user) and (user.is_authenticated):
            return PhotoSerializerUrlNested(track.photo_set, many=True, context=self.context).data
        else:
            return PhotoSerializerUrlNested(track.photo_set.filter(private=False), many=True, context=self.context).data

    class Meta:
        model = Track
        fields = ['id', 'name', 'description', 'color', 'style', 'points_json_optimized', 'status', 'type', 'start_time', 'end_time', 'distance', 'region', 'photo_set', 'videolink_set']

class TrackSerializer(serializers.ModelSerializer):

    class Meta:
        model = Track
        fields = ['id', 'name', 'description', 'color', 'style', 'points_json_optimized', 'status', 'type', 'start_time', 'end_time', 'distance', 'region', 'gpx_file', 'upload_user']

class TrackSerializerNoGpx(serializers.ModelSerializer):

    class Meta:
        model = Track
        fields = ['id', 'name', 'description', 'color', 'style', 'points_json', 'points_json_optimized', 'status', 'type', 'start_time', 'end_time', 'distance', 'region', 'upload_user']

class TrackSerializerFull(serializers.ModelSerializer):
    photo_set = serializers.SerializerMethodField()
    videolink_set = VideoLinkSerializer(many=True)

    def get_photo_set(self, track):
        user = self.context['request'].user
        if (user) and (user.is_authenticated):
            return PhotoSerializerUrlNested(track.photo_set, many=True, context=self.context).data
        else:
            return PhotoSerializerUrlNested(track.photo_set.filter(private=False), many=True, context=self.context).data

    class Meta:
        model = Track
        fields = ['id', 'name', 'description', 'color', 'style', 'points_json_optimized', 'points_json', 'status', 'type', 'start_time', 'end_time', 'distance', 'region', 'gpx_file', 'upload_user', 'photo_set', 'videolink_set']


class PlaceTypeGroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = PlaceTypeGroup
        fields = ['id', 'name', 'pl', 'en', 'order']

class PlaceTypeSerializer(serializers.ModelSerializer):
    group = PlaceTypeGroupSerializer(many=False)

    class Meta:
        model = PlaceType
        fields = ['id', 'name', 'icon', 'pl', 'en', 'order', 'group']

class MapLayerSerializer(serializers.ModelSerializer):

    class Meta:
        model = MapLayer
        fields = ['id', 'is_active', 'order', 'dict_key', 'display_name', 'javascript_code', 'type']

class PhotoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Photo
        fields = ['id', 'name', 'org_filename', 'description', 'place', 'track', 'exif_lat', 'exif_lon', 'image', 'private', 'order', 'past']

class PlaceSerializerTypeNested(serializers.ModelSerializer):
    type = PlaceTypeSerializer(many=False)
    photo_set = PhotoSerializerUrlNested(many=True)
    videolink_set = VideoLinkSerializer(many=True)

    class Meta:
        model = Place
        fields = ['id', 'name', 'description', 'lat', 'lon', 'type', 'approved', 'photo_set', 'videolink_set']

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

class GpsPointSerializer(serializers.ModelSerializer):

    class Meta:
        model = GpsPoint
        fields = ['id', 'name', 'time', 'lat', 'lon', 'created']