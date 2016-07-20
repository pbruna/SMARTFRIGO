import { Component, OnInit, Output, EventEmitter, trigger } from '@angular/core';
import { OrdenDeSalida, EstadosOrden } from '../objetos';
import { OrdenService } from '../servicios/orden.service';
import { DocumentoComponent } from './documento.component';
import { TituloComponent } from './titulo.component'


@Component({
  selector: 'buscar-ordenes',
  templateUrl: './app/componentes/buscar-ordenes.component.html',
  directives: [DocumentoComponent, TituloComponent]
})
export class BuscarOrdenesComponent implements OnInit {
  Ordenes: OrdenDeSalida[];
  Estado: EstadosOrden;
  ShowPrgFolio = false;
  @Output("onSelectOrden") onSelectOrden: EventEmitter<OrdenDeSalida> = new EventEmitter<OrdenDeSalida>()

  constructor(
    private ordenService: OrdenService
  ) { }

  goToEstado(estado: EstadosOrden) {
    if (estado == -1) return;
    this.Ordenes = null;
    this.ordenService.getByEstado(this.Estado)
      .then(ods => this.Ordenes = ods);

  }

  BuscarPorFolio(folio: number) {
    this.ShowPrgFolio = true
    this.ordenService.getByFolioCliente(folio)
      .then(os => {
        this.goToOrden(os);
        this.ShowPrgFolio = false;
      })
      .catch(ev => this.ShowPrgFolio = false);
  }

  goToOrden(orden: OrdenDeSalida) {
    this.onSelectOrden.emit(orden)
  }

  seleccionarOrden(orden: OrdenDeSalida) {
    let osv = this.ordenService
    let fun = function (os: OrdenDeSalida) {
      if (os.Items.length > 10) this.goToOrden(orden);
      else osv.insertOrdenEnFormDTE(orden, orden.Items);
    }
    if (!orden.Items) this.ordenService.getItemsById(orden.Id)
      .then(itm => {
        orden.Items = itm;
        fun(orden);
      })
    else fun(orden);
  }

  ngOnInit() {
    this.Estado = EstadosOrden.Preparada;
    this.goToEstado(this.Estado);
  }

}
