/*
 * Angular 2 decorators and services
 */
import {Directive, Component, View, ElementRef} from 'angular2/angular2';
import {RouteConfig, Router} from 'angular2/router';

import {Broker, BrokerRequest, BrokerEvent} from '../../services/broker';
import {Platform} from '../../services/platform';

/*
 * Angular Directives
 */
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES} from 'angular2/router';

/*
 * PlatformStatus Component
 * Top Level Component
 */
@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'platform-status'
  selector: 'platform-status', // <platform-status></platform-status>
  // We need to tell Angular's compiler which directives are in our template.
  // Doing so will allow Angular to attach our behavior to an element
  directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES],
  // Our list of styles in our component. We may add more to compose many styles together
  styles: [`
    .title {
      font-family: Arial, Helvetica, sans-serif;
    }
    main {
      padding: 1em;
    }
  `],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  template: 
  `
  <div class="container-fluid platform-status">
  <div class="row-fluid">
    <div class="col-sm-6">{{platformStatus.directorCommonName}}</div>
    <div class="col-sm-6"><i class="fa fa-fw fa-circle" [ng-class]="apiStatus.cls"></i> {{apiStatus.msg}}</div>
  </div>
  </div>
  `
})
export class PlatformStatus {
  apiWatcher:any;
  apiStatus:any;
  platformStatus: any;

  constructor(private broker: Broker, private platform: Platform) {
    console.log('initializing platform status component');

    this.clearData();
  }

  onInit() {
    this.broker.on('control4.broker.connected', this.onBrokerConnected);
    this.broker.on('control4.broker.disconnected', this.onBrokerDisconnected);

    if (this.broker.isConnected()) {
      this.getData();
    }
  }

  getData() {
    this.platform.getPlatformStatus().then(
      (result) => {
        this.platformStatus = result;
      },
      (err) => {
        console.error('platform-status: error watching api status', err);
      });

    this.platform.watchAPIStatus(this.onAPIStatusUpdate).then(
      (result) => {
        this.apiWatcher = result;
      },
      (err) => {
        console.error('platform-stauts: error watching api status', err);
      });
  }

  clearData() {
    
    this.apiStatus = {
      cls: 'red',
      msg: 'Disconnected'
    };
    
    this.platformStatus = null;

  }

  onBrokerConnected(msg: BrokerEvent) {
    this.getData();
  }

  onBrokerDisconnected(msg: BrokerEvent) {
    this.clearData();
  }

  onAPIStatusUpdate(update: any) {
    if (update.director === 'alive' || update.director === 'connected') {
      this.apiStatus = {
        cls: 'green',
        msg: 'Connected'
      };
    } if (update.director === 'disconnected') {
      this.apiStatus = {
        cls: 'red',
        msg: 'Disconnected'
      };
    } else {
      this.apiStatus = {
        cls: 'yellow',
        msg: update.director
      };
    }
  }
}
