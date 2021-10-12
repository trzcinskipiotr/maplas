from django.conf import settings
from gpxpy.geo import haversine_distance


def calculate_distance_from_segments(segments):
    distance = 0
    last_point = None
    for segment in segments:
        first_segment_point = True
        for point in segment:
            if last_point and first_segment_point:
                if haversine_distance(last_point[0], last_point[1], point[0], point[1]) >= settings.MERGE_SEGMENT_DISTANCE:
                    last_point = None
            if last_point:
                distance = distance + haversine_distance(last_point[0], last_point[1], point[0], point[1])
            last_point = point
            first_segment_point = False
    return distance
