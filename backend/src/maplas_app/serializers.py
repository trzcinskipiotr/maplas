from rest_framework import serializers

from maplas_app.models import Track

class TrackSerializer(serializers.ModelSerializer):

    class Meta:
        model = Track
        fields = ['id', 'name', 'color', 'points_json']
