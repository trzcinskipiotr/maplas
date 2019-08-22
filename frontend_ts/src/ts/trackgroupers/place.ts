import TrackGrouper from '../TrackGrouper';
import TrackGroup from '../TrackGroup';
import Track from '../Track';

export default class PlaceTrackGrouper implements TrackGrouper {

    public groupTracks(tracks: Track[]): TrackGroup[] {
        const trackGroups: TrackGroup[] = [];
        const trackGroupsArray = {};
        for (const track of tracks) {
            const place = track.gpsTrack.place ? track.gpsTrack.place : 'unassigned';
            if (! trackGroupsArray.hasOwnProperty(place)) {
                trackGroupsArray[place] = new TrackGroup();
                if (place === 'unassigned') {
                    trackGroupsArray[place].translate = 'unassigned';
                } else {
                    trackGroupsArray[place].translate = place;
                }
                trackGroups.push(trackGroupsArray[place]);
            }
            trackGroupsArray[place].tracks.push(track);
        }
        return trackGroups;
    }

}
