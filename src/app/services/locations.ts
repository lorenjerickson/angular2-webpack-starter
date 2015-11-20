import {provide, Provider} from 'angular2/angular2';
import {Injectable} from 'angular2/angular2';

import {Broker, BrokerRequest} from './broker';

export interface ILocation {
  type: number;
  typeName: string;
  name: string;
  id: number;
  parentId: number;
  siteId?: number;
  siteName?: string;
  siteOrder?: number;
  buildingId?: number;
  buildingName?: string;
  buildingOrder?: number;
  floorId?: number;
  floorName?: string;
  floorOrder?: number;
  roomId?: number;
  roomName?: string;
  roomOrder?: number;
}

@Injectable()
export class Locations {

  constructor(
    private broker: Broker
  ) { }

  getSites(): Promise<Array<ILocation>> {
    console.log('locations:getSites()');

    var request: BrokerRequest = {
      path: '/api/v1/locations/sites'
    };

    return this.broker.call(request);
  }

  getBuildings(siteId?: number): Promise<Array<ILocation>> {
    console.log('locations:getBuildings()');

    var request: BrokerRequest = {
      path: '/api/v1/locations/buildings'
    };

    return this.broker.call(request);
  }

  getFloors(buildingId?: number): Promise<Array<ILocation>> {
    console.log('locations:getFloors()');

    var qs = '';
    if (buildingId) {
      qs += '?query=' + encodeURIComponent(JSON.stringify({ buildingId: buildingId }));
    }

    var request: BrokerRequest = {
      path: '/api/v1/locations/floors' + ((qs.length) ? qs : '')
    };

    return this.broker.call(request);
  }

  getRooms(floorId?: number): Promise<Array<ILocation>> {
    console.log('locations:getRooms()');

    var qs = '';
    if (floorId) {
      qs += '?query=' + encodeURIComponent(JSON.stringify({ floorId: floorId }));
    }

    var request: BrokerRequest = {
      path: '/api/v1/locations/rooms' + ((qs.length) ? qs : '')
    };

    return this.broker.call(request);
  }

  getChildLocations(parentId: number): Promise<Array<ILocation>> {
    console.log('locations:getChildLocations()');

    var qs = '?query=' + encodeURIComponent(JSON.stringify({ parentId: parentId }));

    var request: BrokerRequest = {
      path: '/api/v1/locations' + ((qs.length) ? qs : '')
    };

    return this.broker.call(request);
  }

  getLocations(): Promise<Array<ILocation>> {
    console.log('locations:getLocations()');

    var request: BrokerRequest = {
      path: '/api/v1/locations'
    };

    return this.broker.call(request);
  }
  
}

//------------------------------------------------------------------------

export const LOCATIONS_PROVIDERS: any[] = [
  provide(Locations, {
    useClass: Locations,
    deps: [Broker]
  })
];

