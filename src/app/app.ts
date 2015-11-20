/*
 * Angular 2 decorators and services
 */
import {Directive, Component, View, ElementRef} from 'angular2/angular2';
import {RouteConfig, Router} from 'angular2/router';
import {Http, Headers} from 'angular2/http';

/*
 * Angular Directives
 */
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES} from 'angular2/router';

import {Broker, BrokerEvent} from './services/broker';
import {Authorization} from './services/auth';
import {Configuration} from './services/config';
import {Storage} from './services/storage';

import {PlatformStatus} from './components/platform-status/platform-status';
import {Error} from './components/error/error';
import {OauthLogin} from './components/login-oauth/login-oauth';

/*
 * Directive
 * XLarge is a simple directive to show how one is made
 */
@Directive({
  selector: '[x-large]' // using [ ] means selecting attributes
})
export class XLarge {
  constructor(element: ElementRef) {
    // simple DOM manipulation to set font size to x-large
    // `nativeElement` is the direct reference to the DOM element
    element.nativeElement.style.fontSize = 'x-large';
  }
}

/*
 * App Component
 * Top Level Component
 */
@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'app'
  selector: 'app', // <app></app>
  // We need to tell Angular's compiler which directives are in our template.
  // Doing so will allow Angular to attach our behavior to an element
  directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES, XLarge],
  // Our list of styles in our component. We may add more to compose many styles together
  styles: [`
    .title {
      font-family: Arial, Helvetica, sans-serif;
    }
    main {
      padding: 1em;
    }
  `],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  template: `
   	<header class="dash">
			<h1 class="dash__title">{{appName}}</h1>
			<nav class="dash__nav">
				<a class="dash__link" [router-link]="['/PlatformStatus']">Platform Status</a>
			</nav>
		</header>
		<router-outlet></router-outlet>
  `
})
@RouteConfig([
  {
		path: '/',
		redirectTo: '/home'
  }, {
    path: '/platform-status',
    as: 'PlatformStatus',
    component: PlatformStatus
  }, {
    path: '/oauth-login',
    as: 'OauthLogin',
    component: OauthLogin
  }, {
    path: '/error',
    as: 'Error',
    component: Error
  }
])
export class App {

  _connectRetryInterval: any;

  constructor(
    private broker: Broker,
    private auth: Authorization,
    private config: Configuration,
    private storage: Storage,
    private router: Router
  ) {
    console.log('initializing App');
  }

  onInit() {
    console.log('app: oninit()');
    var cfgData = this.storage.get('config');
    if (!cfgData) {
      console.log('app: no config data available');
      // this.config.on('control4.configuration.loaded', this.checkAuth);
      this.config.load('/assets/config/env.json').then(
        (result) => {
          console.log('app: app config loaded, checking auth');
          this.checkAuth();
        },
        (err) => {
          console.error('app: error loading application config', err);
        });
    } else {
      console.log('app: have config, let\s auth');
      this.checkAuth();
    }
  }

  checkAuth() {
    console.log('app: checkauth()');

    if (!this.auth.isAuthorized()) {
      console.log('app: not currently authorized');
      // so we don't have a JWT, but we might be able to make one    
      if (this.auth.isAuthenticated()) {
        console.log('app: am authenticated, let\'s authorize');
        // attempt to re-authorize
        this.auth.on('control4.authorization.authorized', this.initBroker);
        this.auth.authorize();
      } else {
        // not authorized or authenticated, gotta login
        console.log('app: not authenitcated, let\'s login');
        this.router.navigate(['OauthLogin']);
      }
    } else {
      console.log('app: lucky! already authorized, lets init the api');
      this.initBroker();
    }
  }

  initBroker() {
    console.log('app: initbroker()');
    this.broker.on('control4.broker.connected', this.onBrokerConnected);
    this.broker.on('control4.broker.disconnected', this.onBrokerDisconnected);
    this.broker.init({
      connectStream: true
    });
  }

  onBrokerConnected(msg: BrokerEvent) {
    console.log('app: broker connected');
    if (this._connectRetryInterval) {
      console.log('app: clearing connect timeout');
      clearInterval(this._connectRetryInterval);
      this._connectRetryInterval = null;
    }
  }

  onBrokerDisconnected(msg: BrokerEvent) {
    console.log('app: broker disconnected');
    this._connectRetryInterval = setInterval(() => {
      console.log('app: connect timeout expired, let\'s try connecting again');
      this.broker.init({
        connectStream: true
      });
    }, 10000);
  }

}

