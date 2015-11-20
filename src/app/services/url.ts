import {Injectable} from 'angular2/angular2';
import {provide, Provider} from 'angular2/angular2';

import {Storage} from './storage';

@Injectable()
export class URLFactory {

  constructor(
    private storage: Storage
  ) {

  }

  getBrokerURL(path?: string, query?: any): string {
    // TODO 'brokerHost' should probably come from the Config service
    var baseUrl: string = 'https://' + this.storage.get('brokerHost') + ':443';
    return baseUrl + this.compose(path, query);
  }

  getWebServiceURL(path?: string, query?: any): string {
    // TODO 'webServiceHost' should probably come from the Config service
    var baseUrl: string = 'https://' + this.storage.get('webServiceHost') + ':443';
    return baseUrl + this.compose(path, query);
  }

  compose(path?: string, query?: any): string {
    var fullPath = '';

    if (path) {
      // a little sanity checking
      if (path.charAt(0) !== '/') {
        path = '/' + path;
      }
      fullPath += path;
    }

    if (query) {
      var tmp = '';
      Object.keys(query).forEach(function(key) {
        if (query.hasOwnProperty(key)) {
          if (tmp.length > 1) {
            tmp += '&';
          }
          tmp += (key + '=' + encodeURIComponent(query[key]));
        }
      });

      if (tmp.length) {
        fullPath += ('?' + tmp);
      }
    }

    return fullPath;
  }
}

//------------------------------------------------------------------------

export const URLFACTORY_PROVIDERS: any[] = [
  provide(URLFactory, {
    useClass: URLFactory,
    deps: [Storage]
  })
];
