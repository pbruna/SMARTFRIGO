import { Component, EventEmitter, OnInit, Output, trigger, state, style, transition, animate} from '@angular/core';
import { RouteParams } from '@angular/router-deprecated';
import { OrdenDeSalida, EstadosOrden } from '../objetos';
import { OrdenService } from '../servicios/orden.service';
import { DocumentoComponent } from './documento.component'
import { TituloComponent } from './titulo.component'

@Component({
    selector: 'orden',
    templateUrl: './app/componentes/orden.component.html',
    directives: [DocumentoComponent, TituloComponent],
    animations: [
        trigger('flyInOut', [
            state('in', style({ transform: 'translateX(0)' })),
            transition('void <=> *', [style({ transform: 'translateX(100%)' }), animate(10000)])
        ])
    ]
})
export class OrdenComponent implements OnInit {
    orden: OrdenDeSalida;
    check = true;
    lastCheck: number;

    constructor(
        private ordenService: OrdenService,
        private routeParams: RouteParams
    ) { }

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

    ngOnInit() {
        if (this.routeParams.get('folio') !== null) {
            let folio = +this.routeParams.get('folio');
            this.ordenService.getByFolioCliente(folio)
                .then(os => {
                    this.orden = os;
                    if (os.Items) this.checkAll(this.check);
                });
        }
    }

}
