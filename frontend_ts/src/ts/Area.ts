import L from 'leaflet';
import { roundLatLng } from './utils/coords';
import { isPointInPolygon } from 'geolib';

export default class Area {

  public points: L.LatLng[];
  public tile_indexes: string;
  public tileZoomIndexes: any;
  public unique: number;

  constructor(public id: number, public name: string, public description: string, public points_json: string, public color: string, public onServer: boolean) {
    this.points = [];
    for (const point of JSON.parse(this.points_json)) {
      this.points.push(L.latLng(point[0], point[1]));
    }
    this.unique = window.getUnique();
    this.tile_indexes = '';
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

  public parseTileIndexes() {
    this.tileZoomIndexes = JSON.parse(this.tile_indexes);
  }

  public computeTileZoomIndexes() {
    this.tileZoomIndexes = {};
    for (let zoom = 5; zoom <= 18; zoom++) {
      const p1 = window.GLOBALVUE.$store.state.map.project(this.bounds().getNorthWest(), zoom);
      const p2 = window.GLOBALVUE.$store.state.map.project(this.bounds().getSouthEast(), zoom);
      const areaBounds = L.bounds(p1, p2);
      const tileBounds = L.bounds(areaBounds.min.divideBy(256).floor(), areaBounds.max.divideBy(256).floor());
      const indexSet = new Set();
      const points: any =  {};
      for (let i = tileBounds.min.x - 1; i <= tileBounds.max.x + 1; i += 1) {
        points[i] = {};
        for (let j = tileBounds.min.y - 1; j <= tileBounds.max.y + 1; j += 1) {
          points[i][j] = new L.Point(i, j);
        }
      }
      for (let j = tileBounds.min.y; j <= tileBounds.max.y; j += 1) {
        for (let i = tileBounds.min.x; i <= tileBounds.max.x; i += 1) {
          const tileToUnproject = new L.Point(i * 256 + 128, j * 256 + 128);
          const latLng = window.GLOBALVUE.$store.state.map.unproject(tileToUnproject, zoom);
          let tileToAdd = false;
          if (isPointInPolygon({latitude: latLng.lat, longitude: latLng.lng}, this.pointsGeoLib())) {
            tileToAdd = true;
          }
          if (zoom <= 13) {
            tileToAdd = true;
          }
          if (tileToAdd) {
            for (let k = -1; k <= 1; k++) {
              for (let l = -1; l <= 1; l++) {
                indexSet.add(points[i + k][j + l]);
              }
            }
          }
        }
      }
      this.tileZoomIndexes[zoom] = [];
      for (const point of indexSet) {
        this.tileZoomIndexes[zoom].push([point.x, point.y]);
      }
    }
    this.tile_indexes = JSON.stringify(this.tileZoomIndexes);
  }

  public convertToApiSave() {
    this.computeTileZoomIndexes();
    return {id: this.id, name: this.name, description: this.description, color: this.color, points_json: this.points_json, tile_indexes: this.tile_indexes};
  }

}
