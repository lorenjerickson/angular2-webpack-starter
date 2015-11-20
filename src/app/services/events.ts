import {provide, Provider} from 'angular2/angular2';

import {EventEmitter} from 'angular2/angular2';
import {GUID} from './guid';

export class EventProducer<T> {
  private _listeners: Map<string, Map<string, EventEmitter<T>>>;

  constructor(private guid:GUID) {
    this._listeners = new Map<string, Map<string, EventEmitter<T>>>();
  }
  
  on(topic:string, callbackFn:Function):string {
    
    var emitter: EventEmitter<T> = new EventEmitter<T>();
    emitter.subscribe(callbackFn);
    
    var topicListeners = this._listeners.get(topic);
    if (!topicListeners) {
      topicListeners = new Map<string, EventEmitter<T>>();
      this._listeners.set(topic, topicListeners);
    }
    
    var guid:string = this.guid.generate();
    topicListeners.set(guid, emitter);
    
    return guid;
  }
  
  publish(topic:string, event:T) {
    
    var topicListeners = this._listeners.get(topic);
    if (topicListeners) {
      topicListeners.forEach((emitter) => {
        emitter.next(event);
      });
    }
     
  }
  
  off(topic: string, guid: string) {
    var topicListeners = this._listeners.get(topic);
    if (topicListeners) {
      if (topicListeners.has(guid)) {
        topicListeners.delete(guid);  
      }
    }
  }
}

//------------------------------------------------------------------------

export const EVENTS_PROVIDERS: any[] = [
  provide(EventProducer, {
    useClass: EventProducer,
    deps: [GUID]
  })
];

