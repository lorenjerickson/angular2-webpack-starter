import {provide, Provider} from 'angular2/angular2';
import {Injectable} from 'angular2/angular2';

@Injectable()
export class Storage {

  constructor() {
    console.log('storage service init');
  }

  set(key: string, value: any):void {
    console.log('storage:set(' + key + ')');
    window.localStorage.setItem(key, JSON.stringify({value:value}));
  }

  get(key: string): any {
    var val = null;
    var raw = window.localStorage.getItem(key);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.value) {
        val = parsed.value;
      }
    }
    return val;
  }

  remove(key: string):void {
    window.localStorage.removeItem(key);
  }

  setAll(obj: any):void {
    var that = this;
    Object.keys(obj).forEach(function(key) {
      if (obj.hasOwnProperty(key)) {
        that.set(key, obj[key]);
      }
    });
  }

  clear():void {
    window.localStorage.clear();
  }
}

//------------------------------------------------------------------------

export const STORAGE_PROVIDERS: any[] = [
  provide(Storage, {
    useClass: Storage
  })
];
