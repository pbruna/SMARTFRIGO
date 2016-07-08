import { Component, EventEmitter, OnInit, Input, Output} from '@angular/core';
import { OrdenDeSalida, EstadosOrden } from '../objetos';
import { OrdenService } from '../servicios/orden.service';
import { DocumentoComponent } from './documento.component';
import { TituloComponent } from './titulo.component';

@Component({
    selector: 'orden',
    templateUrl: './app/componentes/orden.component.html',
    directives: [DocumentoComponent, TituloComponent],
})
export class OrdenComponent implements OnInit {
    @Input() orden: OrdenDeSalida;
    @Output() volver: EventEmitter<any> = new EventEmitter<any>()
    check = true;
    lastCheck: number;

    constructor(private ordenService: OrdenService) { }

    checkAll(bol: boolean) {
        this.orden.Items.forEach(it => it.checked = bol);
        this.lastCheck = undefined;
    }

    checkItem(i: number, ev: any) {
        if (!isNaN(this.lastCheck) && ev.shiftKey) {
            let paso = 1
            if (this.lastCheck < i) paso = -1;
            let k = paso + i;
            this.orden.Items[this.lastCheck].checked = !this.orden.Items[i].checked;
            while (this.lastCheck != k) {
                this.orden.Items[k].checked = !this.orden.Items[i].checked;
                k += paso;
            }
            this.lastCheck = i;
        } else this.lastCheck = i;
    }

    ingresarSeleccion() {
        this.ordenService.insertOrdenEnFormDTE(this.orden, this.orden.Items.filter(itm => { return itm.checked }));
    }

    ngOnInit() {
        if (!this.orden.Items)
            this.ordenService.getItemsById(this.orden.Id)
                .then(itms => {
                    this.orden.Items = itms
                    itms.forEach(i => i.checked = true)
                });
        else this.orden.Items.forEach(i => i.checked = true)
    }




}
