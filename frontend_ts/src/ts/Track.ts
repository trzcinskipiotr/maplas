import GpsTrack from './GpsTrack';
import L from 'leaflet';

export default class Track {

  public mapTracks: L.Polyline[];
  public animateTracks: any[];
  public startMarker: L.Marker;
  public finishMarker: L.Marker;

  constructor(public gpsTrack: GpsTrack, public checked: boolean, public onServer: boolean) {
    this.mapTracks = [];
    this.animateTracks = [];
    for (const segment of gpsTrack.segments) {
      const poliline = new L.Polyline(segment.pointsArray, {
        color: this.gpsTrack.color,
        weight: 3,
        opacity: 1,
        smoothFactor: 1,
      });
      this.mapTracks.push(poliline);
    }
    const startIcon = L.icon({
      iconUrl: 'img/startflag3.png',
      iconAnchor: [30, 45],
    });
    const finishIcon = L.icon({
      iconUrl: 'img/finishflag3.png',
      iconAnchor: [17, 45],
    });
    const animateTrackHtml = this.gpsTrack.isBicycleTrack() ? '<i class="fa fa-bicycle fa-2x" style="color: black"></i>' : '<i class="fa fa-shoe-prints fa-2x" style="color: black"></i>';
    for (const segment of gpsTrack.segments) {
      // @ts-ignore
      const animateTrack = L.motion.polyline(segment.pointsArray, {
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
      this.animateTracks.push(animateTrack);
    }
    const firstSegment = this.gpsTrack.segments[0].pointsArray;
    const lastSegment = this.gpsTrack.segments[this.gpsTrack.segments.length - 1].pointsArray;
    this.startMarker = new L.Marker([firstSegment[0].lat, firstSegment[0].lng], {icon: startIcon, zIndexOffset: 1});
    this.finishMarker = new L.Marker([lastSegment[lastSegment.length - 1].lat, lastSegment[lastSegment.length - 1].lng], {icon: finishIcon, zIndexOffset: 2});
  }

}
