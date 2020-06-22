import GpsTrack from './GpsTrack';
import L from 'leaflet';
import Segment from './Segment';
import { TrackStatus } from './types';
import { distanceBetweenPoints } from './utils/coords';

export default class Track {

  public mapTracks: L.Polyline[];
  public animateTracks: any[];
  public startMarker: L.Marker;
  public finishMarker: L.Marker;
  public plannedMarkers: L.Marker[];

  public lastRefresh: number;

  constructor(public gpsTrack: GpsTrack, public checked: boolean, public onServer: boolean) {
    this.lastRefresh = 0;
    this.createMapObjects(null);
  }

  public dragEnd(event: L.DragEndEvent) {
    (this.point as L.LatLng).lat = (event.target.getLatLng() as L.LatLng).lat;
    (this.point as L.LatLng).lng = (event.target.getLatLng() as L.LatLng).lng;
    this.obj.moveMarker(this.map);
  }

  public createMapObjects(map: L.Map) {
    this.mapTracks = [];
    this.animateTracks = [];
    this.plannedMarkers = [];
    for (const segment of this.gpsTrack.segments) {
      const poliline = new L.Polyline(segment.pointsArray, {
        color: this.gpsTrack.color,
        weight: 3,
        opacity: 1,
        smoothFactor: 1,
      });
      this.mapTracks.push(poliline);
    }
    const startIcon = L.icon({
      iconUrl: 'img/startflag3.png',
      iconAnchor: [30, 45],
    });
    const finishIcon = L.icon({
      iconUrl: 'img/finishflag3.png',
      iconAnchor: [17, 45],
    });
    const animateTrackHtml = this.gpsTrack.isBicycleTrack() ? '<i class="fa fa-bicycle fa-2x" style="color: black"></i>' : '<i class="fa fa-shoe-prints fa-2x" style="color: black"></i>';
    for (const segment of this.gpsTrack.segments) {
      // @ts-ignore
      const animateTrack = L.motion.polyline(segment.pointsArray, {
        weight: 3,
        opacity: 1,
        smoothFactor: 1,
      }, {
        auto: false,
        // @ts-ignore
        easing: L.Motion.Ease.linear,
      }, {removeOnEnd: true, icon: L.divIcon({
        html: animateTrackHtml,
        iconSize: [32, 32],
        className: 'animateTrackIcon',
      })});
      this.animateTracks.push(animateTrack);
    }
    if (this.gpsTrack.segments.length) {
      const firstSegment = this.gpsTrack.segments[0].pointsArray;
      const lastSegment = this.gpsTrack.segments[this.gpsTrack.segments.length - 1].pointsArray;
      this.startMarker = new L.Marker([firstSegment[0].lat, firstSegment[0].lng], {icon: startIcon, zIndexOffset: 1});
      this.finishMarker = new L.Marker([lastSegment[lastSegment.length - 1].lat, lastSegment[lastSegment.length - 1].lng], {icon: finishIcon, zIndexOffset: 2});
      if (this.gpsTrack.status === TrackStatus.planned) {
        let lastPoint: L.LatLng = null;
        let distance = 0;
        for (const segment of this.gpsTrack.segments) {
          for (const point of segment.pointsArray) {
            const markerIcon = L.icon({
              iconUrl: 'img/circle.svg',
              iconSize: [11, 11],
              iconAnchor: [5, 5],
            });
            const marker = new L.Marker(point, {draggable: true, icon: markerIcon});
            const dragParam = {'obj': this, 'point': point, 'map': map};
            marker.on('dragend', this.dragEnd.bind(dragParam));
            if (lastPoint) {
              distance = distance + distanceBetweenPoints(point.lat, point.lng, lastPoint.lat, lastPoint.lng);
              lastPoint = point;
            } else {
              lastPoint = point;
            }
            marker.bindTooltip((distance / 1000).toFixed(1), {permanent: true, className: 'smallTooltip', direction: 'right'});
            this.plannedMarkers.push(marker);
          }
        }
      }
    }
  }

  public moveMarker(map: L.Map) {
    for (const mapTrack of this.mapTracks) {
      mapTrack.removeFrom(map);
    }
    for (const animateTrack of this.animateTracks) {
      animateTrack.removeFrom(map);
    }
    for (const marker of this.plannedMarkers) {
      marker.removeFrom(map);
    }
    if (this.startMarker) {
      this.startMarker.removeFrom(map);
    }
    if (this.finishMarker) {
      this.finishMarker.removeFrom(map);
    }
    this.createMapObjects(map);
    this.lastRefresh = Date.now();
  }

  public addPoint(lat: number, lon: number, map: L.Map) {
    if (this.gpsTrack.segments.length === 0) {
      const segment = new Segment([[lat, lon]]);
      this.gpsTrack.segments.push(segment);
    } else {
      this.gpsTrack.segments[this.gpsTrack.segments.length - 1].addPoint(lat, lon);
    }
    this.moveMarker(map);
  }

}
