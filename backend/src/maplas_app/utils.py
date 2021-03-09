from pathlib import Path

import gpxpy
import json
import rdp

from gpxpy.geo import haversine_distance

from django.conf import settings

from maplas_app.models import Track

def convert_gpx_string_to_array(gpx_file_string):
    gpx = gpxpy.parse(gpx_file_string)
    tracks = []
    for track in gpx.tracks:
        segments = []
        distance = round(track.length_2d())
        start_time, end_time = track.get_time_bounds()
        for segment in track.segments:
            points = []
            for point in segment.points:
                points.append([point.latitude, point.longitude])
            segments.append(points)
        new_segments = []
        new_segment = []
        last_point = None
        for index_s, segment in enumerate(segments):
            for index_p, point in enumerate(segment):
                if (index_p == 0) and (last_point):
                    if haversine_distance(last_point[0], last_point[1], point[0], point[1]) >= settings.MERGE_SEGMENT_DISTANCE:
                        new_segments.append(new_segment)
                        new_segment = []
                new_segment.append(point)
                last_point = point
        new_segments.append(new_segment)
        tracks.append((gpx.name, distance, start_time, end_time, new_segments))
    return tracks

def create_track_from_gpx_file(filename):
    gpx_file = open(filename, 'r')
    gpx_file_string = gpx_file.read()
    tracks = convert_gpx_string_to_array(gpx_file_string)
    for (gpx_name, distance, start_time, end_time, segments) in tracks:
        database_track = Track.objects.create(name=gpx_name or Path(filename).stem, points_json=json.dumps(segments), distance=distance, status=Track.Status.done,
                         type=Track.Type.bicycle, start_time=start_time, end_time=end_time, gpx_file=gpx_file_string)
        optimize_track(database_track)

def fill_array_from_gpx_file(track):
    (gpx_name, distance, start_time, end_time, segments) = convert_gpx_string_to_array(track.gpx_file)[0]
    track.points_json = json.dumps(segments)
    optimize_track(track)

def optimize_points(points_json):
    return rdp.rdp(points_json, epsilon=settings.OPTIMIZE_EPSILON, algo='iter', return_mask=False)

def optimize_track(track):
    segments_json = json.loads(track.points_json)
    optimized_segments = []
    for segment_json in segments_json:
        optimized_segment = optimize_points(segment_json)
        optimized_segments.append(optimized_segment)
    track.points_json_optimized = json.dumps(optimized_segments)
    track.save()

def optimize_tracks():
    tracks = Track.objects.all()
    for track in tracks:
        optimize_track(track)
