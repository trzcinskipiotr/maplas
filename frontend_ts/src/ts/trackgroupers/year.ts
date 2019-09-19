import TrackGrouper from '../TrackGrouper';
import TrackGroup from '../TrackGroup';
import Track from '../Track';

export default class YearTrackGrouper implements TrackGrouper {

  public groupTracks(tracks: Track[]): TrackGroup[] {
    const trackGroups: TrackGroup[] = [];
    const trackGroupsArray: { [key: string]: TrackGroup } = {};
    for (const track of tracks) {
      const year = track.gpsTrack.start_time ? track.gpsTrack.start_time.getFullYear() : 'unassigned';
      const strYear = String(year);
      if (!trackGroupsArray.hasOwnProperty(strYear)) {
        trackGroupsArray[strYear] = new TrackGroup();
        if (strYear === 'unassigned') {
          trackGroupsArray[strYear].translate = 'unassigned';
        } else {
          trackGroupsArray[strYear].label = strYear;
        }
        trackGroups.push(trackGroupsArray[strYear]);
      }
      trackGroupsArray[strYear].tracks.push(track);
    }
    return trackGroups;
  }

}
