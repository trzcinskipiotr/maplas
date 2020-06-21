import moment from 'moment';
import Track from '@/ts/Track';

export function formatDate(value: Date) {
  if (value) {
    return moment(String(value)).format('DD.MM.YYYY H:mm');
  }
}

export function formatDateSeconds(value: Date) {
  if (value) {
    return moment(String(value)).format('DD.MM.YYYY H:mm:ss');
  }
}

export function formatTimeSeconds(value: Date) {
  if (value) {
    return moment(String(value)).format('H:mm:ss');
  }
}

export function formatDateDay(value: Date) {
  if (value) {
    return moment(String(value)).format('DD.MM.YYYY');
  }
}

export function roundTrackDistance(value: number) {
  if (value) {
    return String(Math.round(value / 100) / 10) + 'km';
  } else {
    return '0km';
  }
}

export function roundFileBytes(value: number) {
  if (value < 1024) {
    return String(value) + 'B';
  } else if (value < 1024 * 1024) {
    return String(Math.round(value / 1024 * 10) / 10) + 'KB';
  } else {
    return String(Math.round(value / (1024 * 1024) * 100) / 100) + 'MB';
  }
}

export function sumTracksDistance(tracks: Track[]) {
  let distance = 0;
  for (const track of tracks) {
    distance = distance + track.gpsTrack.distance;
  }
  return distance;
}


export function sumTracksDistanceWalk(tracks: Track[]) {
  let distance = 0;
  for (const track of tracks) {
    if (track.gpsTrack.isWalkTrack()) {
      distance = distance + track.gpsTrack.distance;
    }
  }
  return distance;
}

export function sumTracksDistanceBicycle(tracks: Track[]) {
  let distance = 0;
  for (const track of tracks) {
    if (track.gpsTrack.isBicycleTrack()) {
      distance = distance + track.gpsTrack.distance;
    }
  }
  return distance;
}

export function sumTracksDistanceMushroom(tracks: Track[]) {
  let distance = 0;
  for (const track of tracks) {
    if (track.gpsTrack.isMushroomTrack()) {
      distance = distance + track.gpsTrack.distance;
    }
  }
  return distance;
}



export function dragElement(element: any, header: any) {
  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0;
  if (header) {
    // if present, the header is where you move the DIV from:
    header.onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    element.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e: any) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e: any) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    const oldpos1 = pos1;
    const oldpos3 = pos3;
    pos1 = pos3 - e.clientX;
    pos3 = e.clientX;
    element.style.left = (element.offsetLeft - pos1) + 'px';
    if (element.offsetLeft - pos1 < 0) {
      element.style.left = '0';
      pos1 = oldpos1;
      pos3 = oldpos3;
    }
    if (element.offsetLeft + element.offsetWidth > document.body.offsetWidth) {
      element.style.left = document.body.offsetWidth - element.offsetWidth + 'px';
      pos1 = oldpos1;
      pos3 = oldpos3;
    }

    const oldpos2 = pos2;
    const oldpos4 = pos4;
    pos2 = pos4 - e.clientY;
    pos4 = e.clientY;
    // set the element's new position:
    element.style.top = (element.offsetTop - pos2) + 'px';
    if (element.offsetTop - pos2 < 0) {
      element.style.top = '0';
      pos2 = oldpos2;
      pos4 = oldpos4;
    }
    if (element.offsetTop + element.offsetHeight > document.body.offsetHeight) {
      element.style.top = document.body.offsetHeight - element.offsetHeight + 'px';
      pos2 = oldpos2;
      pos4 = oldpos4;
    }
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
