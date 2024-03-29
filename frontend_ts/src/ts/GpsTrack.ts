import {TrackType, TrackStatus} from './types';
import L from 'leaflet';
import Region from '@/ts/Region';
import Segment from '@/ts/Segment';
import Photo from './Photo';
import VideoLink from './VideoLink';

export default class GpsTrack {

    public segments: Segment[];
    /* tslint:disable-next-line */
    public points_json: string = undefined;
    public photos: Photo[];
    public videos: VideoLink[];

    /* tslint:disable-next-line */
    constructor(public id: number, public name: string, public description: string, public points_json_optimized: string, public color: string, public distance: number, public status: TrackStatus, public type: TrackType, public start_time: Date, public end_time: Date, public gpx_file: string, public region: Region) {
      this.photos = [];
      this.videos = [];
      this.refreshSegments();
    }

    public refreshSegments() {
      this.segments = [];
      for (const segment of JSON.parse(this.points_json_optimized)) {
        const segmentObj = new Segment(segment);
        this.segments.push(segmentObj);
      }
    }

    public addPhoto(photo: Photo) {
      this.photos.push(photo);
    }

    public addVideo(video: VideoLink) {
      this.videos.push(video);
    }

    public convertToApiTrackSave() {
      return {id: this.id, name: this.name, description: this.description, color: this.color, distance: this.distance, status: this.status, type: this.type, region: this.region ? this.region.id : undefined};
    }

    public convertToApiGpxFileSave() {
      const uploadUser: number = null;
      return {name: this.name, description: this.description, color: this.color, distance: this.distance, status: this.status, type: this.type, start_time: this.start_time, end_time: this.end_time, gpx_file: this.gpx_file, region: this.region ? this.region.id : undefined, upload_user: uploadUser};
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
