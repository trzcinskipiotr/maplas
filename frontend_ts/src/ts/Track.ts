import GpsTrack from './GpsTrack';
import L from 'leaflet';

export default class Track {

  public mapTrack: L.Polyline;
  public animateTrack: any;
  public startMarker: L.Marker;
  public finishMarker: L.Marker;

  constructor(public gpsTrack: GpsTrack, public checked: boolean, public onServer: boolean) {
    this.mapTrack = new L.Polyline(this.gpsTrack.pointsArray, {
      color: this.gpsTrack.color,
      weight: 3,
      opacity: 1,
      smoothFactor: 1,
    });
    const startIcon = L.icon({
      iconUrl: 'img/startflag3.png',
      iconAnchor: [30, 45],
    });
    const animateTrackHtml = this.gpsTrack.isBicycleTrack() ? '<i class="fa fa-bicycle fa-2x" style="color: black"></i>' : '<i class="fa fa-shoe-prints fa-2x" style="color: black"></i>';
    // @ts-ignore
    this.animateTrack = L.motion.polyline(this.gpsTrack.pointsArray, {
      weight: 3,
      opacity: 1,
      smoothFactor: 1,
    }, {
      auto: false,
      // @ts-ignore
      easing: L.Motion.Ease.linear,
    }, {removeOnEnd: true, icon: L.divIcon({
      html: animateTrackHtml,
      iconSize: [32, 32],
      className: 'animateTrackIcon',
    })});
    const finishIcon = L.icon({
      iconUrl: 'img/finishflag3.png',
      iconAnchor: [17, 45],
    });
    const tmpArray = this.gpsTrack.pointsArray;
    this.startMarker = new L.Marker([tmpArray[0].lat, tmpArray[0].lng], {icon: startIcon, zIndexOffset: 1});
    this.finishMarker = new L.Marker([tmpArray[tmpArray.length - 1].lat, tmpArray[tmpArray.length - 1].lng], {icon: finishIcon, zIndexOffset: 2});
  }

}
