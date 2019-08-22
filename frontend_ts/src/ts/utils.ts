import moment from 'moment';
import Track from '@/ts/Track';

export function formatDate(value: Date) {
  if (value) {
    return moment(String(value)).format('DD.MM.YYYY H:mm');
  }
}

export function roundTrackDistance(value: number) {
  if (value) {
    return String(Math.round(value / 100) / 10) + 'km';
  } else {
    return '0km';
  }
}

export function sumTracksDistance(tracks: Track[]) {
  let distance = 0;
  for (const track of tracks) {
    distance = distance + track.gpsTrack.distance;
  }
  return distance;
}


export function sumTracksDistanceWalk(tracks: Track[]) {
  let distance = 0;
  for (const track of tracks) {
    if (track.gpsTrack.isWalkTrack()) {
      distance = distance + track.gpsTrack.distance;
    }
  }
  return distance;
}

export function sumTracksDistanceBicycle(tracks: Track[]) {
  let distance = 0;
  for (const track of tracks) {
    if (track.gpsTrack.isBicycleTrack()) {
      distance = distance + track.gpsTrack.distance;
    }
  }
  return distance;
}

