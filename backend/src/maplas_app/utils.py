import gpxpy
import json

from maplas_app.models import Track

def create_track_from_gpx(filename):
    gpx_file = open(filename, 'r')
    gpx = gpxpy.parse(gpx_file)

    points = []
    for track in gpx.tracks:
        for segment in track.segments:
            for point in segment.points:
                points.append([point.latitude, point.longitude])
    Track.objects.create(name=gpx.name, points_json=json.dumps(points))
