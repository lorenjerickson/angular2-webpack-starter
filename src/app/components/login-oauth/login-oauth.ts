/*
 * Angular 2 decorators and services
 */
import {Directive, Component, View, ElementRef} from 'angular2/angular2';
import {RouteConfig, Router} from 'angular2/router';

import {URLFactory} from '../../services/url';
import {Platform} from '../../services/platform';
import {Storage} from '../../services/storage';
import {Authorization} from '../../services/auth';

declare var window: any;

/*
 * Angular Directives
 */
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {HTTP_PROVIDERS, Http, Headers} from 'angular2/http';

/*
 * PlatformStatus Component
 * Top Level Component
 */
@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'oauth-login'
  selector: 'oauth-login', // <oauth-login></oauth-login>
  // We need to tell Angular's compiler which directives are in our template.
  // Doing so will allow Angular to attach our behavior to an element
  directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES],
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
  template:
  `
  <div class="oauth2">
  <div class="oauth2-container">
    <iframe class="oauth2-frame" [src]="authURL" frameborder="0" width="640" height="480" onLoad="evaluateURL(this.contentWindow.location.href)"></iframe>
  </div>
  </div>
  `
})
export class OauthLogin {
  private lastError: any;
  public authURL: string;

  constructor(
    private http: Http,
    private url: URLFactory,
    private storage: Storage,
    private auth: Authorization,
    private router: Router
  ) {
    console.log('login: initializing login component');

  }

  onInit() {
    console.log('login: oninit()')

    var that = this;
    var redirectURL = this.storage.get('redirectURL');
    var appKey = this.storage.get('appKey');


    var query = {
      client_id: appKey,
      redirect_uri: redirectURL,
      response_type: 'token'
    };
    
    this.authURL = this.url.getWebServiceURL('/authentication/oauth2/auth', query);

  }

  evaluateURL(url) {
    var token;
    var redirectURL = this.storage.get('redirectURL');

    if (url.indexOf(redirectURL) === 0) {
      // var $url = $('<a/>').attr('href', url);
      // var hash = $url[0].hash.substring(1);
      // var kvpairs = hash.split('&');
      // for (var i in kvpairs) {
      //   var kv = kvpairs[i].split('=');
      //   if (kv[0] === 'access_token' || kv[0] === 'token') {
      //     token = kv[1];
      //     break;
      //   }
      // }
        
      var idx = url.indexOf('#');
      if (idx > 0) {
        var hash = url.substring(idx + 1);
        var params = hash.split('&');
        for (var p in params) {
          var parts = params[p].split('=');
          if (parts.length === 2) {
            if (parts[0] === 'access_token' || parts[0] === 'token') {
              this.validateAccessToken(parts[1]);
              break;
            }
          }
        }
      }
    }
  }

  validateAccessToken(token: string) {
    var that = this;
    if (token) {
      this.auth.authorize(token).then(
        function() {
          that.router.navigate(['PlatformStatus', {}]);
        },
        function(err) {
          that.lastError = { message: 'error logging in', err: err };
        });
    } else {
      that.lastError = { message: 'invalid login.  please try again.' };
    }
  }

}
