import {provide, Provider} from 'angular2/angular2';
import {Http, Headers} from 'angular2/http';
import {Injectable, EventEmitter, Observable} from 'angular2/angular2';

import {Authorization} from './auth';
import {Storage} from './storage';
import {URLFactory} from './url';
import {EventProducer} from './events';
import {GUID} from './guid';

declare var $: any;
declare var window: any;

export interface BrokerEvent {
  data?: any;
}

export interface BrokerRequest {
  path: string;
  method?: string;
  filter?: Object;
  fields?: Array<string>;
  varNames?: Array<string>;
  properties?: Array<string>;
  SubscriptionClientId?: string;
  JWT?: string;
  data?: any;
}

export interface BrokerOptions {
  connectStream: boolean;
}

export interface BrokerSubscriber {
  id: string;
  unsubscribe: Function;
}

@Injectable()
export class Broker extends EventProducer<BrokerEvent> {
  private _connecting: boolean;
  private _subscribers: Map<string, Function>;
  private _subscriptionClientId: string;
  private _socket: any;
  private _loadSocketIOTimeout: any;

  constructor(
    private http: Http,
    private storage: Storage,
    private urlFactory: URLFactory,
    private auth: Authorization
  ) {
    super(new GUID());
    
    this._connecting = false;
  }

  call(request: BrokerRequest): Promise<any> {
    console.log('broker:call()');
    return new Promise((resolve, reject) => {
      var url = this.buildURL(request);
      console.log('broker:call(): url = ' + url);
      var headers = this.buildHeaders(request);

      this.http.request(url, {
        headers: headers,
        method: request.method || 'GET'
      }).map((res:any) => res.json())
        .subscribe(
        err => {
          console.error('error making request', err);
          reject(err);
        },
        data => {
          console.log('request response received', data);
          resolve(data);
        },
        () => {
          console.log('request complete', request);
        });
    });
  }

  // TODO look at using Observable instead of Function here
  subscribe(request: BrokerRequest, callbackFn: Function): Promise<string> {
    console.log('broker:subscribe()');
    return new Promise((resolve, reject) => {
      request.SubscriptionClientId = this._subscriptionClientId;
      var url = this.buildURL(request);
      console.log('broker:subscribe(): url = ' + url);
      var headers = this.buildHeaders(request);

      this.http.request(url, {
        headers: headers,
        method: 'GET'
      }).map((res:any) => res.json())
        .subscribe(
        err => {
          console.error('error making request', err);
          reject(err);
        },
        data => {
          console.log('request response received', data);
          if (data.subscriptionId) {
            this._subscribers.set(data.subscriptionId, callbackFn);
            this._socket.on(data.subscriptionId, callbackFn);
            this._socket.emit('startSubscription', data.subscriptionId);

            resolve(data.subscriptionId);
          } else {
            console.error('subscription not created, no subscriptionId received from server');
            reject({ message: 'subscription not created' });
          }
        },
        () => {
          console.log('request complete', request);
        });
    });
  }

  unsubscribe(subscriberId: string): void {
    var callbackFn: Function = this._subscribers.get(subscriberId);
    if (callbackFn !== null && typeof callbackFn === 'function') {
      this._socket.removeListener(subscriberId, callbackFn);
      this._socket.emit('endSubscription', subscriberId);
      this._subscribers.delete(subscriberId);
    }
  }

  init(options: BrokerOptions): Promise<any> {
    console.log('broker:init()');
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        // NOTE only let one caller trigger the initalization of the API
        if (!this._connecting) {
          this._connecting = true;

          this._loadSocketIOTimeout = setTimeout(() => {
            console.error('error loading socket.io, is broker running?');
            this.manualDisconnect();
          }, 60000);

          var url = this.urlFactory.getBrokerURL('/socket.io/socket.io.js', {
            JWT: this.auth.getAuthToken()
          });
          console.log('get socket.io url is ' + url);
          
          // NOTE ng2 http does not yet support examining response headers, so we'll have to get socket.io every time
          // var socketIOMD5 = this.storage.get('socketIOMD5');
          var headers = new Headers();

          var options = {
            headers: headers
          };

          this.http.request(url, options)
            .map((res:any) => { return res.text(); })
            .subscribe(
            err => {
              clearTimeout(this._loadSocketIOTimeout);
              this._loadSocketIOTimeout = null;

              console.error('error getting socket.io', err);
              reject(err);
            },
            data => {
              clearTimeout(this._loadSocketIOTimeout);
              this._loadSocketIOTimeout = null;

              console.log('got socket.io');
              $.globalEval(data);
              this.connect().then(
                (result) => {
                  resolve(result);
                },
                (err) => {
                  console.error('broker: unable to initialize broker socket connection, subscriptions are unavaialble', err);
                  reject(err);
                });
            },
            () => {
              console.log('retrieve socket.io request complete');
            }
            );
        }

      } else {
        // NOTE in the else case here the promise will just get returned, therefore concurrent requests will all wait
        // for the connected promise to be fulfilled
        resolve();
      }
    });
  }

  endAllSubscriptions() {
    console.log('broker: endAllSubscriptions');

    for (var k in this._subscribers) {
      this.unsubscribe(k);
    }
    this._subscribers.clear();

    this._socket.removeAllListeners();
    this._socket.emit('endAllSubscriptions');
  }

  isConnected(): boolean {
    return (this._socket !== null && this._subscriptionClientId !== null);
  }
  
  /**
   * @see manualDisconnect
   * This function is used to allow a consumer to forcce the service to reconnect to Broker.  This
   * can be important in situations where, for example, an app on a mobile device is suspended and then
   * resumed.  In this case it is important to force this service to rebuild its internal state. Since
   * it's not known how long the app was suspended.  
   */
  manualReconnect(): Promise<any> {
    return this.connect();
  }
  
  /**
   * @see manualReconnect
   * This method is called to force this service to disconnect from Broker. This can be important for cases
   * where, for example, an app on a mobile device is being suspended.  In this case it can take several minutes
   * for the connection to broker to disconnect due to inactivity.  It is useful therefore to be able to force
   * the service to disconnect as the app is being suspended.
   */
  manualDisconnect(): Promise<any> {
    return this.disconnect();
  }
  
  private connect(): Promise<any> {
    return new Promise(function(resolve, reject) {
      if (this.isConnected()) {
        this.disconnect();
      }

      var options = {};
      // NOTE assume https protocol here
      options['connect timeout'] = 100;
      options['forceNew'] = true;
      options['JWT'] = this.auth.getAuthToken();
      if (this._socket.protocol === 1) {
        options['transports'] = ['xhr-polling'];
      } else {
        options['transports'] = ['polling'];
      }

      var url = this.urlFactory.getBrokerURL();

      this.publish('control4.broker.disconnected', {});

      this._socket = window.io.connect(url, options);
      this._socket.heartbeatTimeout = 10000;
      this._socket.closeTimeout = 10000;

      this.publish('control4.broker.disconnected');

      this._socket.on('connect', function() {
        console.log('broker: connected');

        if (this._socket.io && this._socket.io.engine) {
          this._subscriptionClientId = this._socket.io.engine.id;
        } else {
          this._subscriptionClientId = this._socket.socket.sessionId;
        }

        if (!this._subscriptionClientId) {
          console.error('broker: error initalizing broker api, no subscription client id received');
          reject({ message: 'no subscription client id received' });
        } else {
          console.log('broker: subscriptionClientId is ' + this._subscriptionClientId);
          this._events.next({topic:'control4.broker.disconnected'});
        }
      });

      this._socket.on('disconnect', function() {
        console.log('broker: disconnected');
        this._events.next({topic:'control4.broker.disconnected'});
      });

      this._socket.on('reconnecting', function() {
        console.log('broker: reconnecting');
        this._events.next({topic:'control4.broker.reconnecting'});
      });

      this._socket.on('reconnect', function() {
        console.log('broker: reconnected');
        this._events.next({topic:'control4.broker.reconnected'});
      });

      this._socket.on('reconnect_failed', function() {
        console.log('broker: reconnect failed');
        this._events.next({topic:'control4.broker.reconnect_failed'});
      });

      this._socket.once('connect', function() {
        console.log('broker: initialized');
        this._events.next({topic:'control4.broker.initialized'});
      });

    });
  }

  private disconnect(): Promise<any> {
    return new Promise(function(resolve, reject) {
      try {
        if (this._socket) {
          if (this._socket.disconnectSync) {
            this._socket.disconnectSync();
          } else {
            this._socket.disconnect();
          }
        }

        if (this._socket) {
          this._socket.removeAllListeners();
          delete this._socket;
          if (typeof (window.io) !== 'undefined' && window.io.sockets) {
            window.io.sockets = {};
          }
        }

        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  private buildURL(request: BrokerRequest): string {
    var query: any = {
      query: request.filter,
      fields: request.fields,
      JWT: request.JWT,
      properties: request.properties,
      varNames: request.varNames,
      SubscriptionClient: request.SubscriptionClientId
    };

    return this.urlFactory.getBrokerURL(request.path, query);
  }

  private buildHeaders(request: BrokerRequest): Headers {
    var headers = new Headers();
    headers.append('Authorization', this.auth.getAuthToken());
    headers.append('Accept', 'application/json');

    return headers;
  }
}

//------------------------------------------------------------------------

export const BROKER_PROVIDERS: any[] = [
  provide(Broker, {
    useClass: Broker,
    deps: [Authorization, Storage, URLFactory, EventProducer, GUID]
  })
];
