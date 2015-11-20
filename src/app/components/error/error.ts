/*
 * Angular 2 decorators and services
 */
import {Directive, Component, View, ElementRef} from 'angular2/angular2';
import {RouteConfig, Router} from 'angular2/router';

declare var window: any;

/*
 * Angular Directives
 */
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {HTTP_PROVIDERS, Http, Headers} from 'angular2/http';

/*
 * PlatformStatus Component
 * Top Level Component
 */
@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'error'
  selector: 'error', // <error></error>
  // We need to tell Angular's compiler which directives are in our template.
  // Doing so will allow Angular to attach our behavior to an element
  directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, ROUTER_DIRECTIVES],
  // Our list of styles in our component. We may add more to compose many styles together
  styles: [`
    .error {
      padding: 32px;
      background: #d22;
      color: #fff;
    }
  `],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  template: `
  <div class="error">ERROR</div> 
  `
})
export class Error {
  private lastError:any;
  
  constructor() {
    console.log('error: initializing error component');

  }

  onInit() {

  }

}
