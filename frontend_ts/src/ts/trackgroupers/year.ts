import TrackGrouper from '../TrackGrouper';
import TrackGroup from '../TrackGroup';
import Track from '../Track';

export default class YearTrackGrouper implements TrackGrouper {

    public groupTracks(tracks: Track[]): TrackGroup[] {
        const trackGroups: TrackGroup[] = [];
        const trackGroupsArray = {};
        for (const track of tracks) {
            const year = track.gpsTrack.startTime.getFullYear();
            const strYear = String(year);
            if (! trackGroupsArray.hasOwnProperty(strYear)) {
                trackGroupsArray[strYear] = new TrackGroup();
                if (strYear === '1970') {
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
