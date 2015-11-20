import {provide, Provider} from 'angular2/angular2';

import {Injectable} from 'angular2/angular2';

@Injectable()
export class GUID {
  generate(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
      function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
  }
}

//------------------------------------------------------------------------

export const GUID_PROVIDERS: any[] = [
  provide(GUID, {
    useClass: GUID
  })
];

