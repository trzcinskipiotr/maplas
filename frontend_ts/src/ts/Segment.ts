import L from 'leaflet';
import { getPathLength, getPreciseDistance } from 'geolib';

export default class Segment {

  public pointsArray: L.LatLng[];
  public distance: number;

  constructor(segment: any) {
    this.pointsArray = [];
    const tmpPointsArray = [];
    for (const point of segment) {
      const gpsPoint = new L.LatLng(point[0], point[1]);
      this.pointsArray.push(gpsPoint);
      tmpPointsArray.push({latitude: point[0], longitude: point[1]});
    }
    this.distance = getPathLength(tmpPointsArray, getPreciseDistance);
  }

}
