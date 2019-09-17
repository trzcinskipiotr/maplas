import {AlertStatus} from './types';

export default class Alert {

  public date: number;
  public startTimeout: boolean;

  constructor(public status: AlertStatus, public message: string, public id: number, public timeout: number) {
    this.date = Date.now();
    this.startTimeout = false;
  }

}
