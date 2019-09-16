import Track from './Track';

export default class TrackGroup {

  public tracks: Track[];
  public label?: string;
  public translate?: string;

  constructor() {
    this.tracks = [];
  }

}
