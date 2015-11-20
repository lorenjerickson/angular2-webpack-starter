import {provide, Provider} from 'angular2/angular2';

import {Broker, BrokerRequest} from './broker';

import {Injectable} from 'angular2/angular2';

export interface Item {
  type: number;
  typeName: string;
  name: string;
  id: number;
  parentId: number;
  URIs?: {
    variables?: string;
    commands?: string;
    bindings?: string;
    network?: string;
  };
  largeImage?: string;
  smallImage?: string;
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
  roomHidden?: boolean;
  tempHidden?: boolean;
  filename?: string;
  proxy?: string;
  proxyOrder?: string;
  protocolId: number;
  protocolName: string;
  protocolFilename: string;
  capabilities?: any;
  allControlBindingsHidden?: number;
  control?: string;
  model?: string;
  manufacturer?: string;
  protocolControl?: string;
  deviceOrder?: number;
  proxyMeta?: Array<{
    name: string;
    smallImage: string;
    smallSource: string;
    largeImage: string;
    largeSource: string;  
  }>;
  proxiesByName?: Map<string, Item>;
  proxiesById?: Map<number, Item>;
  defaultProxy?: Item;
  protocol?: Item;
}

export interface VariableDef {
  id: number;
  varName: string;
  type: string;
  hidden: number;
  value: any;
  name: string;
  roomName: string;
}

export interface PropertyDef {
  name: string;
  type: string;
  readonly: boolean;
  items?: Array<{
    item: Array<string>;
  }>;
  default?: any;
  minimum?: number;
  maximum?: number;  
}

export interface ActionDef {
  name: string;
  command: string;
}

export interface ICommandDef {
  name: string;
  description: string;
  params: Array<{
    name: string;
    desc: string;    
  }>;
}

export interface ICommandExec {
  command: string;
  tParams: any;
}

export interface ActionExec {
  action: string;
}

export interface BindingDef {
  
}

export interface NetworkDef {

}

export interface Documentation {
  id: number;
  name: string;
  type: string;
  documentation: string;
}

@Injectable()
export class Items {

  constructor(
    private broker: Broker
  ) { }

  getChildren(parentId: number, filter?: any, fields?: Array<string>): Promise<Array<Item>> {
    console.log('items:getChildren()');

    if (filter) {
      var newFilter:any = {
        $and: [
          { parentId: parentId }
        ]
      };

      var conditions:Array<any> = newFilter.$and;
      Object.keys(filter).forEach((key:string) => {
        if (filter.hasOwnProperty(key)) {
          var val:any = filter[key];
          conditions.push(val);
        }
      });

      filter = newFilter;
    } else {
      filter = { parentId: parentId };
    }

    var request: BrokerRequest = {
      path: '/api/v1/items',
      filter: filter,
      fields: fields
    };

    return this.broker.call(request);
  }

  getItems(filter?: Object, fields?: Array<string>): Promise<Array<Item>> {
    console.log('items:getItems()');
    
    var request: BrokerRequest = {
      path: '/api/v1/items',
      filter: filter,
      fields: fields
    };

    return this.broker.call(request);
  }

  getItemById(id: number, fields?: Array<string>): Promise<Item> {
    console.log('items:getItemById()');

    var request: BrokerRequest = {
      path: '/api/v1/items/' + id,
      fields: fields
    };

    return this.broker.call(request);
  }

  getVariables(id: number, variables?: Array<string>): Promise<Array<VariableDef>> {
    console.log('items:getVariables()');

    var request: BrokerRequest = {
      path: '/api/v1/items/' + id + '/variables',
      varNames: variables
    };

    return this.broker.call(request);
  }

  watchVariables(id: number, callbackFn: Function, variables?: Array<string>): Promise<any> {
    console.log('items:watchVariables()');

    var request: BrokerRequest = {
      path: '/api/v1/items/' + id + '/variables',
      varNames: variables
    };

    return this.broker.subscribe(request, callbackFn);
  }

  getProperties(id: number, properties?: Array<string>): Promise<Array<PropertyDef>> {
    console.log('items:getProperties()');

    var request: BrokerRequest = {
      path: '/api/v1/items/' + id + '/properties',
      properties: properties
    };

    return this.broker.call(request);
  }

  watchProperties(id: number, callbackFn: Function, properties?: Array<string>): Promise<any> {
    console.log('items:watchProperties()');

    var request: BrokerRequest = {
      path: '/api/v1/items/' + id + '/properties',
      properties: properties
    };

    return this.broker.subscribe(request, callbackFn);
  }

  updateProperties(id: number, properties: Object): Promise<any> {
    console.log('items:updateProperties()');

    var request: BrokerRequest = {
      method: 'POST',
      path: '/api/v1/items/' + id + '/properties',
      data: properties
    };

    return this.broker.call(request);
  }

  unwatch(subscriber: any):void {
    console.log('items:getChildren()');
    this.broker.unsubscribe(subscriber);
  }

  getCommands(id: number): Promise<Array<ICommandDef>> {
    console.log('items:getCommands()');
    
    var request: BrokerRequest = {
      path: '/api/v1/items/' + id + '/commands'
    };

    return this.broker.call(request);
  }

  executeCommand(id:number, command: ICommandExec): Promise<any> {
    console.log('items:executeCommand()');

    var request: BrokerRequest = {
      method: 'POST',
      path: '/api/v1/items/' + id + '/commands',
      data: command
    };

    return this.broker.call(request);
  }

  getActions(id: number): Promise<Array<ActionDef>> {
    console.log('items:getActions()');

    var request: BrokerRequest = {
      path: '/api/v1/items/' + id + '/actions'
    };

    return this.broker.call(request);
  }

  executeAction(id: number, action: ActionExec): Promise<any> {
    console.log('items:executeAction()');

    var request: BrokerRequest = {
      method: 'POST',
      path: '/api/v1/items/' + id + '/actions',
      data: action
    };

    return this.broker.call(request);
  }

  getBindings(id: number): Promise<Array<BindingDef>> {
    console.log('items:getBindings()');

    var request: BrokerRequest = {
      path: '/api/v1/items/' + id + '/bindings'
    };

    return this.broker.call(request);
  }

  getNetwork(id: number): Promise<Array<NetworkDef>> {
    console.log('items:getNetwork()');

    var request: BrokerRequest = {
      path: '/api/v1/items/' + id + '/network'
    };

    return this.broker.call(request);
  }

  getDocumentation(id: number): Promise<Documentation> {
    console.log('items:getDocumentation()');

    var request: BrokerRequest = {
      path: '/api/v1/items/' + id + '/documentation'
    };

    return this.broker.call(request);
  }
}

//------------------------------------------------------------------------

export const ITEMS_PROVIDERS: any[] = [
  provide(Items, {
    useClass: Items,
    deps: [Broker]
  })
];

