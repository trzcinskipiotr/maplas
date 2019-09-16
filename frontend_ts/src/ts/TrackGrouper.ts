import Track from './Track';
import TrackGroup from './TrackGroup';

export default interface TrackGrouper {

  groupTracks(tracks: Track[]): TrackGroup[];

}
