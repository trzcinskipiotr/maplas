import GpsTrack from './GpsTrack';
import L from 'leaflet';

export default class Track {

  public mapTrack: L.Polyline;

  constructor(public gpsTrack: GpsTrack, public checked: boolean) {
    this.mapTrack = new L.Polyline(this.gpsTrack.pointsArray, {
      color: this.gpsTrack.color,
      weight: 3,
      opacity: 1,
      smoothFactor: 1,
    });
  }

}
