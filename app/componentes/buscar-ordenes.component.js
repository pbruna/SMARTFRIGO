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
var router_deprecated_1 = require('@angular/router-deprecated');
var objetos_1 = require('../objetos');
var orden_service_1 = require('../servicios/orden.service');
var documento_component_1 = require('./documento.component');
var titulo_component_1 = require('./titulo.component');
var BuscarOrdenesComponent = (function () {
    function BuscarOrdenesComponent(ordenService, routeParams, router) {
        this.ordenService = ordenService;
        this.routeParams = routeParams;
        this.router = router;
    }
    BuscarOrdenesComponent.prototype.goToEstado = function (estado) {
        if (estado == -1)
            return;
        this.router.navigate(['BuscarOrden', { estado: objetos_1.EstadosOrden[estado] }]);
    };
    BuscarOrdenesComponent.prototype.BuscarPorFolio = function (folio) {
        this.Ordenes = [];
        this.goToOrden(folio);
    };
    BuscarOrdenesComponent.prototype.goToOrden = function (folio) {
        this.router.navigate(['OrdenDetail', { folio: folio }]);
    };
    BuscarOrdenesComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.routeParams.get('estado') !== null && this.routeParams.get('estado') != '') {
            this.Estado = objetos_1.EstadosOrden[this.routeParams.get('estado')];
        }
        else
            this.Estado = objetos_1.EstadosOrden.Preparada;
        this.ordenService.getByEstado(this.Estado)
            .then(function (ods) { return _this.Ordenes = ods; });
    };
    BuscarOrdenesComponent = __decorate([
        core_1.Component({
            selector: 'buscar-ordenes',
            templateUrl: './app/componentes/buscar-ordenes.component.html',
            directives: [router_deprecated_1.ROUTER_DIRECTIVES, documento_component_1.DocumentoComponent, titulo_component_1.TituloComponent],
            animations: [
                core_1.trigger('flyInOut', [
                    core_1.state('in', core_1.style({ transform: 'translateX(0)' })),
                    core_1.transition('void <=> *', [core_1.style({ transform: 'translateX(-100%)' }), core_1.animate(10000)])
                ])
            ]
        }), 
        __metadata('design:paramtypes', [orden_service_1.OrdenService, router_deprecated_1.RouteParams, router_deprecated_1.Router])
    ], BuscarOrdenesComponent);
    return BuscarOrdenesComponent;
}());
exports.BuscarOrdenesComponent = BuscarOrdenesComponent;
//# sourceMappingURL=buscar-ordenes.component.js.map