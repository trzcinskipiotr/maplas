import TrackGrouper from '../TrackGrouper';
import TrackGroup from '../TrackGroup';
import Track from '../Track';
import { TrackType } from '../types';

export default class TypeTrackGrouper implements TrackGrouper {

  public groupTracks(tracks: Track[]): TrackGroup[] {
    const trackGroups: TrackGroup[] = [];
    const trackGroupWalk = new TrackGroup();
    trackGroupWalk.translate = 'walkTracks';
    const trackGroupBicycle = new TrackGroup();
    trackGroupBicycle.translate = 'bicycleTracks';
    const trackGroupMushroom = new TrackGroup();
    trackGroupMushroom.translate = 'mushroomTracks';
    for (const track of tracks) {
      if (track.gpsTrack.type === TrackType.walk) {
        trackGroupWalk.tracks.push(track);
      }
      if (track.gpsTrack.type === TrackType.bicycle) {
        trackGroupBicycle.tracks.push(track);
      }
      if (track.gpsTrack.type === TrackType.mushroom) {
        trackGroupMushroom.tracks.push(track);
      }
    }
    if (trackGroupBicycle.tracks.length > 0) {
      trackGroups.push(trackGroupBicycle);
    }
    if (trackGroupWalk.tracks.length > 0) {
      trackGroups.push(trackGroupWalk);
    }
    if (trackGroupMushroom.tracks.length > 0) {
      trackGroups.push(trackGroupMushroom);
    }
    return trackGroups;
  }

}
