import {TrackType, TrackStatus} from './types';
import L from 'leaflet';
import Place from '@/ts/Place';

export default class GpsTrack {

    public pointsArray: L.LatLng[];

    /* tslint:disable-next-line */
    constructor(public id: number, public name: string, public description: string, public points_json_optimized: string, public color: string, public distance: number, public status: TrackStatus, public type: TrackType, public startTime: Date, public endTime: Date, public place?: Place) {
      this.pointsArray = [];
      for (const point of JSON.parse(this.points_json_optimized)) {
        const gpsPoint = new L.LatLng(point[0], point[1]);
        this.pointsArray.push(gpsPoint);
      }
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
