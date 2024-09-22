/* tslint:disable:no-console */

import { register } from 'register-service-worker';

if ((process.env.NODE_ENV === 'production') && (process.env.VUE_APP_PWA)) {

  let isControlled = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (isControlled) {
      // ...and if the page was previosly controlled, reload the page.
      window.location.reload();
    } else {
      // ...otherwise, set the flag for future updates, but don't reload.
      isControlled = true;
    }
  });

  register(`${process.env.BASE_URL}service-worker-reload.js`, {
    ready() {
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB',
      );
    },
    registered() {
      console.log('Service worker has been registered.');
    },
    cached() {
      console.log('Content has been cached for offline use.');
    },
    updatefound() {
      console.log('New content is downloading.');
    },
    updated() {
      console.log('New content is available; please refresh.');
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode.');
    },
    error(error) {
      console.error('Error during service worker registration:', error);
    },
  });

}
