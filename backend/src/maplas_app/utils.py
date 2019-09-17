from pathlib import Path

import gpxpy
import json
import rdp

from django.conf import settings

from maplas_app.models import Track

def convert_gpx_to_array(gpx_file_string):
    gpx = gpxpy.parse(gpx_file_string)
    points = []
    distance = 0
    for track in gpx.tracks:
        distance = round(track.length_2d())
        start_time, end_time = track.get_time_bounds()
        for segment in track.segments:
            for point in segment.points:
                points.append([point.latitude, point.longitude])
    return (gpx.name, distance, start_time, end_time, points)

def create_track_from_gpx(filename):
    gpx_file = open(filename, 'r')
    gpx_file_string = gpx_file.read()
    gpx_name, distance, start_time, end_time, points = convert_gpx_to_array(gpx_file_string)
    database_track = Track.objects.create(name=gpx_name or Path(filename).stem, points_json=json.dumps(points), distance=distance, status=Track.Status.done,
                         type=Track.Type.bicycle, start_time=start_time, end_time=end_time, gpx_file=gpx_file_string)
    optimize_track(database_track)

def fill_array_from_gpx_file(track):
    gpx_name, distance, start_time, end_time, points = convert_gpx_to_array(track.gpx_file);
    track.points_json = json.dumps(points)
    optimize_track(track)

def optimize_points(points_json):
    points = json.loads(points_json)
    return rdp.rdp(points, epsilon=settings.OPTIMIZE_EPSILON, algo='iter', return_mask=False)

def optimize_track(track):
    track.points_json_optimized = optimize_points(track.points_json)
    track.save()

def optimize_tracks():
    tracks = Track.objects.all()
    for track in tracks:
        optimize_track(track)
