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
