import L from 'leaflet';
import { getPathLength, getPreciseDistance } from 'geolib';

export default class Segment {

  public pointsArray: L.LatLng[];
  public distance: number;

  constructor(segment: any) {
    this.pointsArray = [];
    for (const point of segment) {
      const gpsPoint = new L.LatLng(point[0], point[1]);
      this.pointsArray.push(gpsPoint);
    }
    this.calculateDistance();
  }

  public calculateDistance() {
    const tmpPointsArray = [];
    for (const point of this.pointsArray) {
      tmpPointsArray.push({latitude: point.lat, longitude: point.lng});
    }
    this.distance = getPathLength(tmpPointsArray, getPreciseDistance);
  }

  public addPoint(lat: number, lon: number) {
    const gpsPoint = new L.LatLng(lat, lon);
    this.pointsArray.push(gpsPoint);
    this.calculateDistance();
  }

}
