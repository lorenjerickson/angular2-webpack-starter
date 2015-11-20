import {provide, Provider} from 'angular2/angular2';
import {Broker, BrokerRequest} from './broker';
import {Item, Items, VariableDef} from './items';

import {Injectable} from 'angular2/angular2';

@Injectable()
export class Categories {

  constructor(
    private broker: Broker
  ) {
    console.log('categories: ctor');
  }

  getCategories(): Promise<Array<string>> {
    console.log('categories:getCategories()');
    return new Promise((resolve, reject) => {
      var request: BrokerRequest = {
        path: '/api/v1/categories'
      };

      this.broker.call(request).then(
        (result) => {
          resolve(result);
        },
        (err) => {
          console.error('error getting categories', err);
          reject(err);
        });
    });
  }

  getItems(category: string, filter?: Object, fields?: Array<string>): Promise<Array<Item>> {
    console.log('categories:getItems()');
    return new Promise((resolve, reject) => {
      var request: BrokerRequest = {
        path: '/api/v1/categories/' + category,
        filter: filter,
        fields: fields
      };

      this.broker.call(request).then(
        (result) => {
          resolve(result);
        },
        (err) => {
          console.error('error getting category items', err);
          reject(err);
        });
    });
  }


  getVariables(category: string, variables?: Array<string>): Promise<Array<VariableDef>> {
    console.log('categories:getVariables()');
    return new Promise((resolve, reject) => {
      var request: BrokerRequest = {
        path: '/api/v1/categories/' + category + '/variables',
        varNames: variables
      };

      this.broker.call(request).then(
        (result) => {
          resolve(result);
        },
        (err) => {
          console.error('error getting category variables', err);
          reject(err);
        });
    });
  }


  watchVariables(category: string, callbackFn: Function, variables?: Array<string>): Promise<string> {
    console.log('categories:watchVariables()');
    return new Promise((resolve, reject) => {
      var request: BrokerRequest = {
        path: '/api/v1/categories/' + category + '/variables',
        varNames: variables
      };

      this.broker.subscribe(request, callbackFn).then(
        (result) => {
          resolve(result);
        },
        (err) => {
          console.error('error watching category variables', err);
          reject(err);
        });
    });
  }


  getProperties(category: string, properties?: Array<string>): Promise<Array<VariableDef>> {
    console.log('categories:getItems()');
    return new Promise((resolve, reject) => {
      var request: BrokerRequest = {
        path: '/api/v1/categories/' + category + '/properties',
        properties: properties
      };

      this.broker.call(request).then(
        (result) => {
          resolve(result);
        },
        (err) => {
          console.error('error getting category properties', err);
          reject(err);
        });
    });
  }


  watchProperties(category: string, callbackFn: Function, properties?: Array<string>): Promise<string> {
    console.log('categories:getItems()');
    return new Promise((resolve, reject) => {
      var request: BrokerRequest = {
        path: '/api/v1/categories/' + category + '/properties',
        properties: properties
      };

      this.broker.subscribe(request, callbackFn).then(
        (result) => {
          resolve(result);
        },
        (err) => {
          console.error('error watching category properties', err);
          reject(err);
        });
    });
  }

  // ------------- convenience functions for a single item within the category

  getItem(category: string, id: number, fields?: Array<string>): Promise<Item> {
    console.log('categories:getItems()');
    return new Promise((resolve, reject) => {
      var request: BrokerRequest = {
        path: '/api/v1/categories/' + category + '/' + id,
        fields: fields
      };

      this.broker.call(request).then(
        (result) => {
          resolve(result);
        },
        (err) => {
          console.error('error getting category item', err);
          reject(err);
        });
    });
  }

  getItemVariables(category: string, id: number, variables?: Array<string>): Promise<Array<VariableDef>> {
    console.log('categories:getItems()');
    return new Promise((resolve, reject) => {
      var request: BrokerRequest = {
        path: '/api/v1/categories/' + category + '/' + id + '/variables',
        varNames: variables
      };

      this.broker.call(request).then(
        (result) => {
          resolve(result);
        },
        (err) => {
          console.error('error getting category item variables', err);
          reject(err);
        });
    });
  }

  watchItemVariables(category: string, id: number, callbackFn: Function, variables?: Array<string>): Promise<string> {
    console.log('categories:getItems()');
    return new Promise((resolve, reject) => {
      var request: BrokerRequest = {
        path: '/api/v1/categories/' + category + '/' + id + '/variables',
        varNames: variables
      };

      this.broker.subscribe(request, callbackFn).then(
        (result) => {
          resolve(result);
        },
        (err) => {
          console.error('error getting category item variables', err);
          reject(err);
        });
    });
  }

  getItemProperties(category: string, id: number, properties?: Array<string>): Promise<Array<VariableDef>> {
    console.log('categories:getItems()');
    return new Promise((resolve, reject) => {
      var request: BrokerRequest = {
        path: '/api/v1/categories/' + category + '/' + id + '/properties',
        properties: properties
      };

      this.broker.call(request).then(
        (result) => {
          resolve(result);
        },
        (err) => {
          console.error('error getting category item properties', err);
          reject(err);
        });
    });
  }

  watchItemProperties(category: string, id: number, callbackFn: Function, properties?: Array<string>): Promise<string> {
    console.log('categories:getItems()');
    return new Promise((resolve, reject) => {
      var request: BrokerRequest = {
        path: '/api/v1/categories/' + category + '/' + id + '/properties',
        properties: properties
      };

      this.broker.subscribe(request, callbackFn).then(
        (result) => {
          resolve(result);
        },
        (err) => {
          console.error('error getting category item properties', err);
          reject(err);
        });
    });
  }

  // TODO network, bindings, documentation, commands, actions, etc.


  // -------------------- general functions
  
  unwatch(watcher: string): void {
    console.log('categories:getItems()');
    this.broker.unsubscribe(watcher);
  }

}

//------------------------------------------------------------------------

export const CATEGORIES_PROVIDERS: any[] = [
  provide(Categories, {
    useClass: Categories,
    deps: [Broker, Items]
  })
];
