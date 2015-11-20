import {provide, Provider} from 'angular2/angular2';
import {Injectable, EventEmitter} from 'angular2/angular2';
import {Http} from 'angular2/http';

import {Storage} from './storage';
import {GUID} from './guid';
import {EventProducer} from './events';

export interface ConfigEvent {
  data?: any;
}

@Injectable()
export class Configuration extends EventProducer<ConfigEvent> {

  constructor(
    private http: Http,
    private storage: Storage
  ) {
    super(new GUID());
    console.log('config: ctor');
  }

  load(path: string): Promise<any> {
    console.log('configuration:load()');

    return new Promise((resolve, reject) => {
      this.http.get(path)
        .map((res: any) => { 
          return res.json(); 
        })
        .subscribe(
        (data: any) => {
          if (data) {
            this.storage.setAll(data);

            var env: string = this.storage.get('env');
            if (env && data.hosts[env]) {
              this.storage.setAll(data.hosts[env]);
            }

            if (data.hosts.local.brokerHost.indexOf('CONTROLLER') === 0) {
              console.warn('config: controller IP address for local config does not appear to be set');
            }

            if (data.appKey.indexOf('APPLICATION') === 0) {
              console.warn('config: appKey does not appear to be set');
            }

            if (data.redirectURL.indexOf('REDIRECT') === 0) {
              console.warn('config: redirectURL does not appear to be set');
            }

            resolve();
          } else {
            reject({ message: 'no configuration data received from path: ' + path });
          }
        },
        err => reject(err),
        () => console.log('config.load complete')
        );
    });
  }
}

//------------------------------------------------------------------------

export const CONFIG_PROVIDERS: any[] = [
  provide(Configuration, {
    useClass: Configuration,
    deps: [Storage, GUID, EventProducer]
  })
];

