import L from 'leaflet';
import PlaceType from './PlaceType';
import Photo from './Photo';
import 'lightgallery.js';
import 'lightgallery.js/dist/css/lightgallery.css';
import 'lg-fullscreen.js';
import 'lg-zoom.js';
import 'lg-hash.js';
import 'lg-autoplay.js';
import VideoLink from './VideoLink';

export default class Place {

  public marker: L.Marker;
  public photos: Photo[];
  public videos: VideoLink[];

  constructor(public id: number, public name: string, public description: string, public lat: number, public lon: number, public type: PlaceType, public approved: boolean, zoomLevel: number, draggable: boolean) {
    const markerSizeClass = this.getMarkerSizeClass(zoomLevel);
    const markerIconClass = this.getMarkerIconClass();
    const iconHtml = '<i style="color: blue" class="fas ' + markerIconClass + ' ' + markerSizeClass + '"></i>';
    const markerIcon = L.divIcon({
      html: iconHtml,
      className: 'dummy',
    });
    this.marker = new L.Marker([lat, lon], {icon: markerIcon, draggable: draggable});
    this.photos = [];
    this.videos = [];
  }

  public convertToApiPlaceSave() {
    return {id: this.id, name: this.name, description: this.description, lat: this.lat, lon: this.lon, type: this.type.id};
  }

  public setDraggable(drag: boolean) {
    if (this.marker.dragging) {
      if (drag) {
        this.marker.dragging.enable();
      } else {
        this.marker.dragging.disable();
      }
    }
  }

  public addPhoto(photo: Photo) {
    this.photos.push(photo);
  }

  public addVideo(video: VideoLink) {
    this.videos.push(video);
  }

  public getMarkerSizeClass(zoomLevel: number) {
    if (zoomLevel <= 11) {
      return 'fa-1x';
    } else {
      return 'fa-2x';
    }
  }

  public getMarkerIconClass() {
    if (this.type) {
      if (this.type.icon) {
        return this.type.icon;
      } else {
        return 'fa-map-marker';
      }
    } else {
      return 'fa-map-marker';
    }
  }

  public changeMarkerSize(zoomLevel: number) {
    const markerSizeClass = this.getMarkerSizeClass(zoomLevel);
    const markerIconClass = this.getMarkerIconClass();
    const iconHtml = '<i style="color: blue" class="fas ' + markerIconClass + ' ' + markerSizeClass + '"></i>';
    const markerIcon = L.divIcon({
      html: iconHtml,
      className: 'dummy',
    });
    this.marker.setIcon(markerIcon);
  }
}
