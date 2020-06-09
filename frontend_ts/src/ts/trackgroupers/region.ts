import TrackGrouper from '../TrackGrouper';
import TrackGroup from '../TrackGroup';
import Track from '../Track';
import Region from '../Region';

export default class RegionTrackGrouper implements TrackGrouper {

  public groupTracks(tracks: Track[]): TrackGroup[] {
    const trackGroups: TrackGroup[] = [];
    const trackGroupsArray: { [key: string]: TrackGroup } = {};
    for (const track of tracks) {
      const region = track.gpsTrack.region ? track.gpsTrack.region.name : 'unassigned';
      if (!trackGroupsArray.hasOwnProperty(region)) {
        trackGroupsArray[region] = new TrackGroup();
        if (region === 'unassigned') {
          trackGroupsArray[region].translate = 'unassigned';
        } else {
          trackGroupsArray[region].translate = region;
        }
        trackGroups.push(trackGroupsArray[region]);
      }
      trackGroupsArray[region].tracks.push(track);
    }
    return trackGroups;
  }

}
