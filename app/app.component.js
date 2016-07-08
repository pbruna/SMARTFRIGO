"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var buscar_ordenes_component_1 = require('./componentes/buscar-ordenes.component');
var orden_component_1 = require('./componentes/orden.component');
var orden_service_1 = require('./servicios/orden.service');
var tmp = 1000;
var AppComponent = (function () {
    function AppComponent() {
        this.showO = false;
    }
    AppComponent.prototype.SeleccionarOrden = function (os) {
        this.orden = os;
        this.showO = true;
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'smart-frigo',
            template: "<div>\n    <div class=\"divClass\" @flyLeft=\"showO ? 'void' : 'in' \" >\n        <buscar-ordenes (onSelectOrden)=\"SeleccionarOrden($event)\"></buscar-ordenes>\n    </div>\n    <div class=\"divClass\" @flyRight=\"'in'\" *ngIf=\"showO\"><orden [orden]=\"orden\" (volver)=\"showO = false\"></orden></div>\n  </div>",
            directives: [buscar_ordenes_component_1.BuscarOrdenesComponent, orden_component_1.OrdenComponent],
            providers: [orden_service_1.OrdenService],
            styles: ["\n        .divClass {\n            position: fixed;\n            top: 0px;\n            width: 100%;\n            height: 100%;\n            overflow-y: auto;\n        }\n    "],
            animations: [
                core_1.trigger('flyLeft', [
                    core_1.state('in', core_1.style({ transform: 'translateX(0)' })),
                    core_1.transition('void => *', [core_1.style({ transform: 'translateX(-100%)' }), core_1.animate(tmp)]),
                    core_1.state('void', core_1.style({ transform: 'translateX(-100%)' })),
                    core_1.transition('* => void', [core_1.style({ transform: 'translateX(0)' }), core_1.animate(tmp)]),
                ]),
                core_1.trigger('flyRight', [
                    core_1.state('in', core_1.style({ transform: 'translateX(0)' })),
                    core_1.transition('void => *', [core_1.style({ transform: 'translateX(100%)' }), core_1.animate(tmp)]),
                    core_1.state('void', core_1.style({ transform: 'translateX(100%)' })),
                    core_1.transition('* => void', [core_1.style({ transform: 'translateX(0)' }), core_1.animate(tmp)]),
                ])
            ]
        }), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map