import GpsTrack from './GpsTrack';
import L from 'leaflet';

export default class Track {

  public mapTrack: L.Polyline;
  public startMarker: L.Marker;
  public finishMarker: L.Marker;

  constructor(public gpsTrack: GpsTrack, public checked: boolean) {
    this.mapTrack = new L.Polyline(this.gpsTrack.pointsArray, {
      color: this.gpsTrack.color,
      weight: 3,
      opacity: 1,
      smoothFactor: 1,
    });
    const startIcon = L.icon({
      iconUrl: 'img/startflag.png',
      iconAnchor: [5, 32],
    });
    const finishIcon = L.icon({
      iconUrl: 'img/finishflag.png',
      iconAnchor: [5, 32],
    });
    const tmpArray = this.gpsTrack.pointsArray;
    this.startMarker = new L.Marker([tmpArray[0].lat, tmpArray[0].lng], {icon: startIcon});
    this.finishMarker = new L.Marker([tmpArray[tmpArray.length - 1].lat, tmpArray[tmpArray.length - 1].lng], {icon: finishIcon});
  }

}
