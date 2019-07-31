import {TrackType, TrackStatus} from './types';

export default class GpsTrack {

    constructor(public id: number, public name: string, public description: string, public pointsJsonOptimized: string, public color: string, public distance: number, public status: TrackStatus, public type: TrackType, public startTime: Date, public endTime: Date) {
    }

  }
