import { isStringFloat } from '@/ts/utils/js';

export function checkString(value: string) {
  if (value) {
    value = value.trim();
    if (value.indexOf(' ') > 0) {
      const parts = value.split(' ');
      if ((parts.length === 2)  && (isStringFloat(parts[0])) && (isStringFloat(parts[1]))) {
        return true;
      }
    }
  }
  return false;
}

export function splitCoords(value: string) {
  if (checkString(value)) {
    const parts = value.split(' ');
    return [parseFloat(parts[0]), parseFloat(parts[1])];
  }
  return null;
}

export function roundCoord(value: number) {
  return Math.round(value * 100000) / 100000;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

export function distanceBetweenPoints(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c * 1000; // Distance in meters
  return d;
}

export function speedBetweenPoints(p2: any, p1: any) {
  const dist = distanceBetweenPoints(p1.lat, p1.lon, p2.lat, p2.lon);
  const timeS = (p2.time - p1.time) / 1000.0;
  const speedMPS = dist / timeS;
  const speedKPH = (speedMPS * 3600.0) / 1000.0;
  return speedKPH;
}