import { Component } from '@angular/core';

import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from '@angular/router-deprecated';
import { BuscarOrdenesComponent } from './componentes/buscar-ordenes.component';
import { OrdenComponent } from './componentes/orden.component';
import { OrdenService } from './servicios/orden.service';

@Component({
  selector: 'smart-frigo',
  template: '<router-outlet></router-outlet>',
  directives: [ROUTER_DIRECTIVES, BuscarOrdenesComponent],
  providers: [ROUTER_PROVIDERS, OrdenService]
})
@RouteConfig([
  { path: '/:estado', name: 'BuscarOrden', component: BuscarOrdenesComponent, useAsDefault: true },
  { path: '/orden/:folio', name: 'OrdenDetail', component: OrdenComponent }
])
export class AppComponent {
  title = 'SMARTFRIGO';
}
