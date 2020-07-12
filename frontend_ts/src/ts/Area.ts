import L from 'leaflet';
import { roundLatLng } from './utils/coords';

export default class Area {

  public points: L.LatLng[];
  public unique: number;

  constructor(public id: number, public name: string, public description: string, public points_json: string, public color: string, public onServer: boolean) {
    this.points = [];
    for (const point of JSON.parse(this.points_json)) {
      this.points.push(L.latLng(point[0], point[1]));
    }
    this.unique = window.getUnique();
  }

  public bounds() {
    const polygon = new L.Polygon(this.points);
    return polygon.getBounds();
  }

  public pointsGeoLib() {
    const list = [];
    for (const point of this.points) {
      list.push({latitude: point.lat, longitude: point.lng});
    }
    return list;
  }

  public updatePointsJson() {
    let json = '[';
    for (const point of this.points) {
      json = json + '[' + point.lat + ',' + point.lng + ']';
      if (! (point === this.points[this.points.length - 1])) {
        json = json + ',';
      }
    }
    json = json + ']';
    this.points_json = json;
  }

  public addPoint(point: L.LatLng) {
    this.points.push(roundLatLng(point));
    this.updatePointsJson();
  }

  public movePoint(point: L.LatLng, newCoords: L.LatLng) {
    const index = this.points.indexOf(point);
    if (index >= 0) {
      this.points.splice(index, 1, roundLatLng(newCoords));
      this.updatePointsJson();
    }
  }

  public removePoint(point: L.LatLng) {
    const index = this.points.indexOf(point);
    if (index >= 0) {
      this.points.splice(index, 1);
      this.updatePointsJson();
    }
  }

  public addPointMiddle(point: L.LatLng, newCoords: L.LatLng) {
    const index = this.points.indexOf(point);
    if (index >= 0) {
      this.points.splice(index, 0, roundLatLng(newCoords));
      this.updatePointsJson();
    }
  }

  public convertToApiSave() {
    return {id: this.id, name: this.name, description: this.description, color: this.color, points_json: this.points_json};
  }

}
