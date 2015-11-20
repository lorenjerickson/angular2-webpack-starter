/// <reference path="../typings/_custom.d.ts" />

/*
 * Providers provided by Angular
 */
import {bootstrap, FORM_PROVIDERS, ELEMENT_PROBE_PROVIDERS} from 'angular2/angular2';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';

import {AUTH_PROVIDERS} from './services/auth';
import {BROKER_PROVIDERS} from './services/broker';
import {STORAGE_PROVIDERS} from './services/storage';
import {URLFACTORY_PROVIDERS} from './services/url';
import {CONFIG_PROVIDERS} from './services/config';
import {CATEGORIES_PROVIDERS} from './services/categories';
import {PLATFORM_PROVIDERS} from './services/platform';

/*
 * App Component
 * our top level component that holds all of our components
 */
import {App} from './app';

/*
 * Bootstrap our Angular app with a top level component `App` and inject
 * our Services and Providers into Angular's dependency injection
 */
bootstrap(App, [
  // These are dependencies of our App
  AUTH_PROVIDERS,
  BROKER_PROVIDERS,
  STORAGE_PROVIDERS,
  URLFACTORY_PROVIDERS,
  CONFIG_PROVIDERS,
  CATEGORIES_PROVIDERS,
  PLATFORM_PROVIDERS,
  //---------------------------
  FORM_PROVIDERS,
  ROUTER_PROVIDERS,
  HTTP_PROVIDERS,
  ELEMENT_PROBE_PROVIDERS
]);
