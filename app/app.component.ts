import { Component, OnInit, trigger, state, style, transition, animate, enableProdMode } from '@angular/core';
import { OrdenDeSalida } from './objetos';

var tmp = 1000
enableProdMode();
@Component({
    selector: 'smart-frigo',
    template: `<div>
    <div class="divClass" @flyLeft="showO ? 'void' : 'in' " >
        <buscar-ordenes (onSelectOrden)="SeleccionarOrden($event)"></buscar-ordenes>
    </div>
    <div class="divClass" @flyRight="'in'" *ngIf="showO">
        <orden [orden]="orden" (volver)="showO = false"></orden>
    </div>
  </div>`,
    styles : [`
        .divClass {
            position: fixed;
            top: 0px;
            width: 100%;
            height: 100%;
            overflow-y: auto;
        }
    `],
    animations: [
        trigger('flyLeft', [
            state('in', style({ transform: 'translateX(0)'  })),
            transition('void => *', [style({ transform: 'translateX(-100%)' }), animate(tmp)]),
            state('void', style({ transform: 'translateX(-100%)' })),
            transition('* => void', [style({ transform: 'translateX(0)' }), animate(tmp)]),
        ]),
        trigger('flyRight', [
            state('in', style({ transform: 'translateX(0)'  })),
            transition('void => *', [style({ transform: 'translateX(100%)'}), animate(tmp)]),
            state('void', style({ transform: 'translateX(100%)' })),
            transition('* => void', [style({ transform: 'translateX(0)' }), animate(tmp)]),
        ])

    ]

})
export class AppComponent {
    orden: OrdenDeSalida;
    showO = false;

    SeleccionarOrden(os: OrdenDeSalida) {
        this.orden = os;
        this.showO = true;
    }

}
