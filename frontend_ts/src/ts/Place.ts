import L from 'leaflet';
import PlaceType from './PlaceType';
import Photo from './Photo';
import 'lightgallery.js';
import 'lightgallery.js/dist/css/lightgallery.css';
import 'lg-zoom.js';
import 'lg-hash.js';
import 'lg-autoplay.js';
import VideoLink from './VideoLink';
import markerIcons from '@/ts/markerIcons';

export default class Place {

  public marker: L.Marker | L.CircleMarker;
  public photos: Photo[];
  public videos: VideoLink[];

  constructor(public id: number, public name: string, public description: string, public lat: number, public lon: number, public type: PlaceType, public approved: boolean, zoomLevel: number, draggable: boolean) {
    const size = this.getMarkerSize(zoomLevel);
    const anchor = this.getMarkerAnchor(zoomLevel);
    if ((type) && (type.icon instanceof Object)) {
      this.marker = new L.CircleMarker([lat, lon], {radius: size / 2, color: type.icon.color, draggable: draggable});
    } else {
      const markerIconClass = this.getMarkerIconClass();
      const markerIcon = L.icon({iconSize: [size, size], iconAnchor: [anchor, anchor], iconUrl: markerIcons[markerIconClass]});
      this.marker = new L.Marker([lat, lon], {icon: markerIcon, draggable: draggable});
    }
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
      return 'icon12px';
    }
    if (zoomLevel <= 14) {
      return 'icon20px';
    }
    if (zoomLevel <= 16) {
      return 'icon36px';
    }
    return 'icon48px';
  }

  public getMarkerSize(zoomLevel: number) {
    if (zoomLevel <= 11) {
      return 13;
    }
    if (zoomLevel <= 14) {
      return 21;
    }
    if (zoomLevel <= 16) {
      return 37;
    }
    return 49;
  }

  public getMarkerAnchor(zoomLevel: number) {
    if (zoomLevel <= 11) {
      return 6;
    }
    if (zoomLevel <= 14) {
      return 10;
    }
    if (zoomLevel <= 16) {
      return 18;
    }
    return 24;
  }

  public getMarkerIconClass() {
    if (this.type) {
      if (this.type.icon) {
        return this.type.icon.replaceAll('-', '_');
      } else {
        return 'maplas_other';
      }
    } else {
      return 'maplas_other';
    }
  }

  public changeMarkerSize(zoomLevel: number) {
    const markerIconClass = this.getMarkerIconClass();
    const size = this.getMarkerSize(zoomLevel);
    const anchor = this.getMarkerAnchor(zoomLevel);
    const markerIcon = L.icon({
      iconSize: [size, size],
      iconAnchor: [anchor, anchor],
      iconUrl: markerIcons[markerIconClass],
    });
    this.marker.setIcon(markerIcon);
  }
}
