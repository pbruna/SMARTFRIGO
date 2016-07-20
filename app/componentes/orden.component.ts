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
    lastCheck: number;
    cantCheck = 0;

    constructor(private ordenService: OrdenService) { }

    checkFirst10() {
        this.orden.Items.forEach(i => {
            if (this.cantCheck < 10) {
                i.checked = true
                this.cantCheck++;
            }
        })
    }

    checkItem(i: number, ev: any) {
        if (!isNaN(this.lastCheck) && ev.shiftKey) {
            let paso = -1
            if (this.lastCheck < i) paso = 1;
            let k = this.lastCheck + paso;
            if (this.orden.Items[i].checked) this.cantCheck--;
            else this.cantCheck++;

            while (i != k) {
                if (this.orden.Items[k].checked !== !this.orden.Items[i].checked) {
                    if (this.orden.Items[k].checked) this.cantCheck--;
                    else this.cantCheck++;
                }
                if (this.cantCheck < 11)
                    this.orden.Items[k].checked = !this.orden.Items[i].checked;
                else {
                    this.cantCheck--;
                    break;
                }
                k += paso;
            }

        } else {
            this.cantCheck += this.orden.Items[i].checked ? -1 : 1;
        }
        this.lastCheck = i;

    }

    ingresarSeleccion() {
        this.ordenService.insertOrdenEnFormDTE(this.orden, this.orden.Items.filter(itm => { return itm.checked }));
    }

    ngOnInit() {
        if (!this.orden.Items)
            this.ordenService.getItemsById(this.orden.Id)
                .then(itms => {
                    this.orden.Items = itms
                    this.checkFirst10();
                });
        else this.checkFirst10();
    }




}
