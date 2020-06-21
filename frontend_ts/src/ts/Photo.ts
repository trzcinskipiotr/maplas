import L from 'leaflet';

export default class Photo {

  /* tslint:disable-next-line */
  constructor(public id: number, public name: string, public description: string, public org_filename: string, public exif_time_taken: any, public image: string, public image_fullhd: string, public image_thumb: string) {
  }

}
