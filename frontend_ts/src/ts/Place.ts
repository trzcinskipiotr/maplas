import L from 'leaflet';
import PlaceType from './PlaceType';
import Photo from './Photo';
import 'lightgallery.js';
import 'lightgallery.js/dist/css/lightgallery.css';
import 'lg-fullscreen.js';
import 'lg-zoom.js';
import 'lg-hash.js';
import 'lg-autoplay.js';

export default class Place {

  public marker: L.Marker;
  public photos: Photo[];

  constructor(public id: number, public name: string, public description: string, public lat: number, public lon: number, public type: PlaceType, zoomLevel: number) {
    const markerSizeClass = this.getMarkerSizeClass(zoomLevel);
    const markerIconClass = this.getMarkerIconClass();
    const iconHtml = '<i style="color: blue" class="fas ' + markerIconClass + ' ' + markerSizeClass + '"></i>';
    const markerIcon = L.divIcon({
      html: iconHtml,
      className: 'dummy',
    });
    this.marker = new L.Marker([lat, lon], {icon: markerIcon});
    this.photos = [];
  }

  public makeToolTip() {
    const div = document.createElement('div');
    div.style.minWidth = '200px';
    div.innerHTML = this.id + '<b> ' + this.name + '</b><br>' + this.lat + ', ' + this.lon + '<br>';
    if (this.photos.length > 0) {
      const smallImage = document.createElement('img');
      smallImage.src = this.photos[0].image_thumb;
      smallImage.style.maxWidth = '300px';
      smallImage.style.maxHeight = '300px';
      smallImage.style.cursor = 'pointer';
      const dynamicEls: any = [];
      for (const photo of this.photos) {
        const dynamicEl = {src: photo.image, thumb: photo.image_thumb};
        dynamicEls.push(dynamicEl);
      }
      smallImage.onclick = () => {
        window.lightGallery(smallImage, {
          dynamic: true,
          autoplay: true,
          pause: 2000,
          galleryId: new Date().getTime(),
          dynamicEl: dynamicEls,
      }); };
      div.appendChild(smallImage);
    }
    const descDiv = document.createElement('div');
    descDiv.innerHTML = this.description;
    div.appendChild(descDiv);
    this.marker.bindPopup(div, {maxWidth: 'auto', maxHeight: 'auto'});
  }

  public addPhoto(photo: Photo) {
    this.photos.push(photo);
  }

  public getMarkerSizeClass(zoomLevel: number) {
    if (zoomLevel <= 10) {
      return 'fa-1x';
    } else {
      return 'fa-2x';
    }
  }

  public getMarkerIconClass() {
    if (this.type) {
      if (this.type.name === 'camping') {
        return 'fa-campground';
      }
      if (this.type.name === 'parking') {
        return 'fa-parking';
      }
      if (this.type.name === 'road') {
        return 'fa-road';
      }
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
