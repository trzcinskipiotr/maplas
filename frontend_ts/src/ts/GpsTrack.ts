import {TrackType, TrackStatus} from './types';
import L from 'leaflet';
import Place from '@/ts/Place';
import Segment from '@/ts/Segment';

export default class GpsTrack {

    public segments: Segment[];
    /* tslint:disable-next-line */
    public points_json: string = undefined;

    /* tslint:disable-next-line */
    constructor(public id: number, public name: string, public description: string, public points_json_optimized: string, public color: string, public distance: number, public status: TrackStatus, public type: TrackType, public start_time: Date, public end_time: Date, public gpx_file: string, public place: Place) {
      this.segments = [];
      for (const segment of JSON.parse(this.points_json_optimized)) {
        const segmentObj = new Segment(segment);
        this.segments.push(segmentObj);
      }
    }

    public convertToApiTrackSave() {
      return {id: this.id, name: this.name, description: this.description, color: this.color, distance: this.distance, status: this.status, type: this.type, place: this.place ? this.place.id : undefined};
    }

    public convertToApiGpxFileSave() {
      const uploadUser: number = null;
      return {name: this.name, description: this.description, color: this.color, distance: this.distance, status: this.status, type: this.type, start_time: this.start_time, end_time: this.end_time, gpx_file: this.gpx_file, place: this.place ? this.place.id : undefined, upload_user: uploadUser};
    }

    public isBicycleTrack() {
      return this.type === TrackType.bicycle;
    }

    public isWalkTrack() {
      return this.type === TrackType.walk;
    }

    public isMushroomTrack() {
      return this.type === TrackType.mushroom;
    }

    public isDoneTrack() {
        return this.status === TrackStatus.done;
    }
    public isPlannedTrack() {
        return this.status === TrackStatus.planned;
    }

  }
