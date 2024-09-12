import GpsTrack from './GpsTrack';
import L from 'leaflet';
import Segment from './Segment';
import { TrackStatus } from './types';
import { distanceBetweenPoints } from './utils/coords';
import { getCenter } from 'geolib';
import Photo from './Photo';
import * as icons from '@/ts/icons';

export default class Track {

  public mapTracks: L.Polyline[];
  public animateTracks: any[];
  public startMarker: L.Marker;
  public finishMarker: L.Marker;
  public plannedMarkers: L.Marker[];
  public middleMarkers: L.Marker[];

  public maximized: boolean;

  public lastRefresh: number;

  constructor(public gpsTrack: GpsTrack, public checked: boolean, public onServer: boolean) {
    this.lastRefresh = 0;
    this.maximized = false;
    this.createMapObjects(window.GLOBALVUE.$store.state.map);
  }

  public dragEnd(event: L.DragEndEvent) {
    (this.point as L.LatLng).lat = (event.target.getLatLng() as L.LatLng).lat;
    (this.point as L.LatLng).lng = (event.target.getLatLng() as L.LatLng).lng;
    this.obj.moveMarker(this.map);
  }

  public click(event: any) {
    if (event.originalEvent.ctrlKey) {
      const pointsArray = this['obj'].gpsTrack.segments[0].pointsArray;
      const index = pointsArray.indexOf(this.point);
      if (index >= 0) {
        pointsArray.splice(index, 1);
      }
      this.obj.moveMarker(this.map);
    }
  }

  public clickNew(event: L.LeafletMouseEvent) {
    const pointsArray = this['obj'].gpsTrack.segments[0].pointsArray;
    const index = pointsArray.indexOf(this.point);
    if (index >= 0) {
      pointsArray.splice(index, 0, event.latlng);
    }
    this.obj.moveMarker(this.map);
    L.DomEvent.stopPropagation(event);
    return false;
  }

  public createMapObjects(map: L.Map) {
    this.mapTracks = [];
    this.animateTracks = [];
    this.plannedMarkers = [];
    this.middleMarkers = [];
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
      iconUrl: icons.markerTrackStartIcon,
      iconSize: [21, 21],
      iconAnchor: [10, 10],
    });
    const finishIcon = L.icon({
      iconUrl: icons.markerTrackFinishIcon,
      iconSize: [21, 21],
      iconAnchor: [10, 10],
    });
    const animateTrackHtml = this.gpsTrack.isBicycleTrack() ? '<img style="height: 20px;" src="' + icons.bicycle + '" />' : '<img style="height: 20px;" src="' + icons.shoe + '" />';
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
        const markerIcon = L.icon({
          iconUrl: icons.redCircle,
          iconSize: [13, 13],
          iconAnchor: [6, 6],
        });
        const middleMarkerIcon = L.icon({
          iconUrl: icons.blueCircle,
          iconSize: [9, 9],
          iconAnchor: [4, 4],
        });
        for (const segment of this.gpsTrack.segments) {
          for (const point of segment.pointsArray) {
            const marker = new L.Marker(point, {draggable: true, icon: markerIcon, zIndexOffset: 100000});
            const dragParam = {'obj': this, 'point': point, 'map': map};
            marker.on('dragend', this.dragEnd.bind(dragParam));
            marker.on('click', this.click.bind(dragParam));
            if (lastPoint) {
              distance = distance + distanceBetweenPoints(point.lat, point.lng, lastPoint.lat, lastPoint.lng);
              const middle = getCenter([{latitude: point.lat, longitude: point.lng}, {latitude: lastPoint.lat, longitude: lastPoint.lng}]);
              const middleMarker = new L.Marker([middle.latitude, middle.longitude], {icon: middleMarkerIcon, zIndexOffset: 50000});
              middleMarker.on('click', this.clickNew.bind(dragParam));
              this.middleMarkers.push(middleMarker);
              lastPoint = point;
            } else {
              lastPoint = point;
            }
            let decimalPlaces = 1;
            if ((distance > 0) && (distance < 1000)) {
              decimalPlaces = 3;
            }
            marker.bindTooltip((distance / 1000).toFixed(decimalPlaces), {permanent: true, className: 'smallTooltip', direction: 'right'});
            this.plannedMarkers.push(marker);
          }
        }
      }
    }
  }

  public removeMapObjects(map: L.Map) {
    for (const mapTrack of this.mapTracks) {
      mapTrack.removeFrom(map);
    }
    for (const animateTrack of this.animateTracks) {
      animateTrack.removeFrom(map);
    }
    for (const marker of this.plannedMarkers) {
      marker.removeFrom(map);
    }
    for (const marker of this.middleMarkers) {
      marker.removeFrom(map);
    }
    if (this.startMarker) {
      this.startMarker.removeFrom(map);
    }
    if (this.finishMarker) {
      this.finishMarker.removeFrom(map);
    }
  }

  public refreshMapObjects(map: L.Map) {
    this.removeMapObjects(map);
    this.createMapObjects(map);
  }

  public moveMarker(map: L.Map) {
    this.removeMapObjects(map);
    this.createMapObjects(map);
    if (this.gpsTrack.segments.length) {
      this.gpsTrack.segments[0].calculateDistance();
      this.gpsTrack.distance = this.gpsTrack.segments[0].distance;
    }
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
