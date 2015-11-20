import {provide, Provider} from 'angular2/angular2';
import {Injectable} from 'angular2/angular2';

import {Broker, BrokerRequest} from './broker';

// TODO maybe connected/disconnected events belong  here?

@Injectable()
export class Platform {

  constructor(
    private broker: Broker
  ) { }

  getPlatformStatus(): Promise<any> {
    console.log('platform:getPlatformStatus()');

    var request: BrokerRequest = {
      path: '/api/v1/platform_status'
    };

    return this.broker.call(request);
  }

  watchAPIStatus(callbackFn: Function): Promise<any> {
    console.log('platform:watchAPIStatus()');

    var request: BrokerRequest = {
      path: '/api/v1/status'
    };

    return this.broker.subscribe(request, callbackFn);
  }
}

//------------------------------------------------------------------------

export const PLATFORM_PROVIDERS: any[] = [
  provide(Platform, {
    useClass: Platform,
    deps: [Broker]
  })
];

