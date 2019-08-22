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
        for (const track of tracks) {
            if (track.gpsTrack.type === TrackType.walk) {
                trackGroupWalk.tracks.push(track);
            }
            if (track.gpsTrack.type === TrackType.bicycle) {
                trackGroupBicycle.tracks.push(track);
            }
        }
        trackGroups.push(trackGroupBicycle);
        trackGroups.push(trackGroupWalk);
        return trackGroups;
    }

}
