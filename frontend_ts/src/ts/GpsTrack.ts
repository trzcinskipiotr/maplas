import {TrackType, TrackStatus} from './types';
import L from 'leaflet';
import Place from '@/ts/Place';

export default class GpsTrack {

    public pointsArray: L.LatLng[];

    /* tslint:disable-next-line */
    constructor(public id: number, public name: string, public description: string, public points_json_optimized: string, public color: string, public distance: number, public status: TrackStatus, public type: TrackType, public start_time: Date, public end_time: Date, public gpx_file: string, public place: Place) {
      this.pointsArray = [];
      for (const point of JSON.parse(this.points_json_optimized)) {
        const gpsPoint = new L.LatLng(point[0], point[1]);
        this.pointsArray.push(gpsPoint);
      }
    }

    public convertToApiColorSave() {
      return {id: this.id, name: this.name, color: this.color, distance: this.distance, status: this.status, type: this.type};
    }

    public convertToApiGpxFileSave() {
      return {name: this.name, description: this.description, color: this.color, distance: this.distance, status: this.status, type: this.type, start_time: this.start_time, end_time: this.end_time, gpx_file: this.gpx_file, place: this.place ? this.place.id : undefined};
    }

    public isBicycleTrack() {
      return this.type === TrackType.bicycle;
    }
    public isWalkTrack() {
      return this.type === TrackType.walk;
    }
    public isDoneTrack() {
        return this.status === TrackStatus.done;
    }
    public isPlannedTrack() {
        return this.status === TrackStatus.planned;
    }

  }
