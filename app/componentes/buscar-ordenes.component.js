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
var objetos_1 = require('../objetos');
var orden_service_1 = require('../servicios/orden.service');
var documento_component_1 = require('./documento.component');
var titulo_component_1 = require('./titulo.component');
var BuscarOrdenesComponent = (function () {
    function BuscarOrdenesComponent(ordenService) {
        this.ordenService = ordenService;
        this.ShowPrgFolio = false;
        this.onSelectOrden = new core_1.EventEmitter();
    }
    BuscarOrdenesComponent.prototype.goToEstado = function (estado) {
        var _this = this;
        if (estado == -1)
            return;
        this.Ordenes = null;
        this.ordenService.getByEstado(this.Estado)
            .then(function (ods) { return _this.Ordenes = ods; });
    };
    BuscarOrdenesComponent.prototype.BuscarPorFolio = function (folio) {
        var _this = this;
        this.ShowPrgFolio = true;
        this.ordenService.getByFolioCliente(folio)
            .then(function (os) {
            _this.goToOrden(os);
            _this.ShowPrgFolio = false;
        })
            .catch(function (ev) { return _this.ShowPrgFolio = false; });
    };
    BuscarOrdenesComponent.prototype.goToOrden = function (orden) {
        this.onSelectOrden.emit(orden);
    };
    BuscarOrdenesComponent.prototype.seleccionarOrden = function (orden) {
        var osv = this.ordenService;
        var fun = function (os) {
            if (os.Items.length > 10)
                this.goToOrden(orden);
            else
                osv.insertOrdenEnFormDTE(orden, orden.Items);
        };
        if (!orden.Items)
            this.ordenService.getItemsById(orden.Id)
                .then(function (itm) {
                orden.Items = itm;
                fun(orden);
            });
        else
            fun(orden);
    };
    BuscarOrdenesComponent.prototype.ngOnInit = function () {
        this.Estado = objetos_1.EstadosOrden.Preparada;
        this.goToEstado(this.Estado);
    };
    __decorate([
        core_1.Output("onSelectOrden"), 
        __metadata('design:type', core_1.EventEmitter)
    ], BuscarOrdenesComponent.prototype, "onSelectOrden", void 0);
    BuscarOrdenesComponent = __decorate([
        core_1.Component({
            selector: 'buscar-ordenes',
            templateUrl: './app/componentes/buscar-ordenes.component.html',
            directives: [documento_component_1.DocumentoComponent, titulo_component_1.TituloComponent]
        }), 
        __metadata('design:paramtypes', [orden_service_1.OrdenService])
    ], BuscarOrdenesComponent);
    return BuscarOrdenesComponent;
}());
exports.BuscarOrdenesComponent = BuscarOrdenesComponent;
//# sourceMappingURL=buscar-ordenes.component.js.map