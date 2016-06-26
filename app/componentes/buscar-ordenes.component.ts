import { Component, OnInit, trigger, state, style, transition, animate } from '@angular/core';
import { RouteParams, ROUTER_PROVIDERS, ROUTER_DIRECTIVES, Router } from '@angular/router-deprecated';
import { OrdenDeSalida, EstadosOrden } from '../objetos';
import { OrdenService } from '../servicios/orden.service';
import { DocumentoComponent } from './documento.component';
import { TituloComponent } from './titulo.component'


@Component({
  selector: 'buscar-ordenes',
  templateUrl: './app/componentes/buscar-ordenes.component.html',
  directives: [ROUTER_DIRECTIVES, DocumentoComponent, TituloComponent],
  animations: [
    trigger('flyInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      transition('void <=> *', [style({ transform: 'translateX(-100%)' }), animate(10000)])
    ])
  ]
})
export class BuscarOrdenesComponent implements OnInit {
  Ordenes: OrdenDeSalida[];
  Estado: EstadosOrden;
  EstTras: string;

  constructor(
    private ordenService: OrdenService,
    private routeParams: RouteParams,
    private router: Router
  ) { }

  goToEstado(estado: EstadosOrden) {
    if (estado == -1) return;
    this.router.navigate(['BuscarOrden', { estado: EstadosOrden[estado] }]);
  }

  BuscarPorFolio(folio: number) {
    this.Ordenes = [];
    this.goToOrden(folio)
  }

  goToOrden(folio: number) {
    this.router.navigate(['OrdenDetail', { folio: folio }]);
  }

  ngOnInit() {
    if (this.routeParams.get('estado') !== null && this.routeParams.get('estado') != '') {
      this.Estado = EstadosOrden[this.routeParams.get('estado')];
    } else this.Estado = EstadosOrden.Preparada;

    this.ordenService.getByEstado(this.Estado)
      .then(ods => this.Ordenes = ods);
  }

}
