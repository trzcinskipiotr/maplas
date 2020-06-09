import L from 'leaflet';

export default class Photo {

  /* tslint:disable-next-line */
  constructor(public id: number, public name: string, public description: string, public image: string, public image_fullhd: string, public image_thumb: string) {
  }

}
