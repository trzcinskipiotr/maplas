import Vue from 'vue';
import VueI18n from 'vue-i18n';
Vue.use(VueI18n);

const messages = {
en: {
  tracksDownloaded: '{0} tracks downloaded!',
  tracksError: 'Error during track download',
  mainMenu: 'Main menu',
  tracks: 'Tracks',
  settings: 'Settings',
  language: 'Language',
  tracksSelectedDistance: 'Selected tracks distance: ',
  tracksSelected: 'Selected {0} of {1} tracks',
  colorSaved: 'Color saved!',
  colorError: 'Error during color saving!',
  name: 'Name',
  distance: 'Distance',
  type: 'Type',
  startTime: 'Start time',
  status: 'Status',
  id: 'ID',
},
pl: {
  tracksDownloaded: '{0} trasy ściągnięte!',
  tracksError: 'Błąd podczas ściągania tras',
  mainMenu: 'Menu główne',
  tracks: 'Trasy',
  settings: 'Ustawienia',
  language: 'Język',
  tracksSelectedDistance: 'Dystans wybranych tras: ',
  tracksSelected: 'Wybrano {0} z {1} tras',
  colorSaved: 'Kolor zapisany!',
  colorError: 'Błąd zapisywania koloru!',
  name: 'Nazwa',
  distance: 'Dystans',
  type: 'Rodzaj',
  startTime: 'Czas startu',
  status: 'Status',
  id: 'ID',
}};

export default new VueI18n({locale: 'en', fallbackLocale: 'es', messages});
