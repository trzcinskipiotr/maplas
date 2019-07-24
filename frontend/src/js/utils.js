import moment from 'moment'

export function formatDate (value) {
  if (value) {
    return moment(String(value)).format('DD.MM.YYYY H:mm')
  }
}

export function roundTrackDistance (value) {
  if (value) {
    return String(Math.round(value / 100) / 10) + 'km'
  }
}

export function sumTracksDistance (tracks) {
  let distance = 0
  for (let track of tracks) {
    distance = distance + track.gpstrack.distance
  }
  return distance
}
