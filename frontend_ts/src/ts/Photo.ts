import L from 'leaflet';

export default class Photo {

  public jpgsrc: string;
  public marker: L.Marker;

  constructor(public name: string, public description: string, public lat: number, public lon: number) {
    const icon = L.icon({
      iconUrl: 'img/camera.png',
      iconAnchor: [20, 20],
    });
    this.marker = L.marker([this.lat, this.lon], {icon});
  }

}
