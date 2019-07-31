import {AlertStatus} from './types';

export default class Alert {

  public date: number;

  constructor(public status: AlertStatus, public message: string) {
    this.date = Date.now();
  }

}
