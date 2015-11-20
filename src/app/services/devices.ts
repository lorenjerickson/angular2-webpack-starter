import {provide, Provider} from 'angular2/angular2';
import {Injectable} from 'angular2/angular2';

import {Items, Item} from './items';
import {EventProducer} from './events';

@Injectable()
export class Devices {

  constructor(
    private items: Items
  ) { }

  getDevice(id: number): Promise<Item> {
    console.log('devices.getDevice()');

    return new Promise((resolve, reject) => {
      this.items.getItemById(id).then(
        (result) => {
          this.addDeviceDetail(result).then(
            (result) => {
              resolve(result);
            },
            (err) => {
              console.error('error adding device detail', err);
              reject(err);
            });
        },
        (err) => {
          console.error('error getting device', err);
          reject(err);
        });
    });
  }

  private addDeviceDetail(item: Item): Promise<Item> {
    console.log('devices.addDeviceDetail()');

    return new Promise((resolve, reject) => {
      if (item.type === 6) { // protocol
        this.items.getChildren(item.id, { typeName: 'device' }).then(
          (result) => {
            item.proxiesByName = new Map<string, Item>();
            item.proxiesById = new Map<number, Item>();
            result.forEach((proxy) => {
              item.proxiesByName.set(proxy.proxy, proxy);
              item.proxiesById.set(proxy.id, proxy);
            });
            item.defaultProxy = item.proxiesByName.get(item.proxy);
            
            resolve(item);
          },
          (err) => {
            console.log('error getting children', err);
            reject(err);

          });
      } else if (item.type === 7) { // proxy
        console.log('TODO: get parent protocol for proxy');
        resolve(item);
      } else {
        resolve(item);
      }
    });
  }
}

//------------------------------------------------------------------------

export const DEVICES_PROVIDERS: any[] = [
  provide(Devices, {
    useClass: Devices,
    deps: [Items, EventProducer]
  })
];

