import {provide, Provider} from 'angular2/angular2';
import {Injectable, EventEmitter} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http';

import {Storage} from './storage';
import {URLFactory} from './url';
import {EventProducer} from './events';
import {GUID} from './guid';

export interface AuthEvent {
  data?: any;
}

@Injectable()
export class Authorization extends EventProducer<AuthEvent> {

  constructor(
    private http: Http,
    private storage: Storage,
    private url: URLFactory
  ) {
    super(new GUID());

    console.log('auth: ctor');
  }

  authorize(accessToken?: string): Promise<any> {
    return new Promise((resolve: Function, reject: Function) => {
      // TODO not clear where the access token should be set yet
      if (typeof accessToken === 'undefined' || accessToken.length === 0) {
        // we didn't get the access token passed in so assume it's in storage
        accessToken = this.storage.get('accessToken');
        if (!accessToken) {
          // if we still don't have an access token, back to the drawing board
          reject({ message: 'cannot authorize without an access token, probably nedd to oauth again' });
        }
      } else {
        this.storage.set('accessToken', accessToken);
      }

      console.log('authorization:authorize()');

      this.getCurrentAccount(accessToken).then(
        (data: any) => {
          this.exchangeTokens(accessToken, data).then(
            (data: any) => {
              this.publish('control4.authorization.authorized', {});
              resolve(data);
            },
            (err: any) => {
              reject(err);
            });
        },
        (err: any) => {
          reject(err);
        });

    });
  }

  deauthorize(): void {
    console.log('authorization:deauthorize()');
    this.storage.remove('accessToken');
    this.storage.remove('authToken');

    this.publish('control4.authorization.deauthorized', {});
  }

  getAuthToken(): string {
    return this.storage.get('authToken');
  }

  // getAccessToken(): string {
  //   return this.storage.get('accessToken');
  // }

  isAuthenticated(): boolean {
    var accessToken: string = this.storage.get('accessToken');
    return (accessToken !== null && accessToken.length > 0);
  }

  isAuthorized(): boolean {
    var authToken: string = this.storage.get('authToken');
    return (authToken !== null && authToken.length > 0);
  }

  private getCurrentAccount(accessToken: string): Promise<string> {
    return new Promise((resolve: Function, reject: Function) => {
      console.log('authorization:getCurrentAccount()');
      var url = this.url.getWebServiceURL('/account/v2/rest/accounts/current');

      this.http.get(url, {
        headers: this.getHeaders(accessToken)
      })
        .map((res: any) => { res.json(); })
        .subscribe(
          data => resolve(data),
          err => reject(err),
          () => console.log('getCurrentAccount complete')
        );
    });
  }

  private exchangeTokens(accessToken: string, commonName: string): Promise<any> {
    return new Promise((resolve: Function, reject: Function) => {
      console.log('authorization:exchangeTokens()');

      var serviceInfo: any = {
        serviceInfo: {
          commonName: '',
          services: ['director', 'sysman'].join()
        }
      };

      var url = this.url.getWebServiceURL('/authentication/v2/rest/authorization');
      var data = JSON.stringify(serviceInfo);
      var headers = this.getHeaders(accessToken);
      headers.append('Content-Type', 'application/json');

      this.http.post(url, data, {
        headers: this.getHeaders(accessToken)
      })
        .map((res: any) => { res.json(); })
        .subscribe(
        data => resolve(data),
        err => reject(err),
        () => console.log('exchangeTokens complete')
        );
    });
  }

  private getHeaders(token: string): Headers {
    var headers = new Headers();
    headers.append('Authorization', 'Bearer ' + token);
    headers.append('Accept', 'application/json');
    return headers;
  }
}

//------------------------------------------------------------------------

export const AUTH_PROVIDERS: any[] = [
  provide(Authorization, {
    useClass: Authorization,
    deps: [Http, Storage, URLFactory]
  })
];
