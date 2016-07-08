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
var OrdenComponent = (function () {
    function OrdenComponent(ordenService) {
        this.ordenService = ordenService;
        this.volver = new core_1.EventEmitter();
        this.check = true;
    }
    OrdenComponent.prototype.checkAll = function (bol) {
        this.orden.Items.forEach(function (it) { return it.checked = bol; });
        this.lastCheck = undefined;
    };
    OrdenComponent.prototype.checkItem = function (i, ev) {
        if (!isNaN(this.lastCheck) && ev.shiftKey) {
            var paso = 1;
            if (this.lastCheck < i)
                paso = -1;
            var k = paso + i;
            this.orden.Items[this.lastCheck].checked = !this.orden.Items[i].checked;
            while (this.lastCheck != k) {
                this.orden.Items[k].checked = !this.orden.Items[i].checked;
                k += paso;
            }
            this.lastCheck = i;
        }
        else
            this.lastCheck = i;
    };
    OrdenComponent.prototype.ingresarSeleccion = function () {
        this.ordenService.insertOrdenEnFormDTE(this.orden, this.orden.Items.filter(function (itm) { return itm.checked; }));
    };
    OrdenComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (!this.orden.Items)
            this.ordenService.getItemsById(this.orden.Id)
                .then(function (itms) {
                _this.orden.Items = itms;
                itms.forEach(function (i) { return i.checked = true; });
            });
        else
            this.orden.Items.forEach(function (i) { return i.checked = true; });
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', objetos_1.OrdenDeSalida)
    ], OrdenComponent.prototype, "orden", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], OrdenComponent.prototype, "volver", void 0);
    OrdenComponent = __decorate([
        core_1.Component({
            selector: 'orden',
            templateUrl: './app/componentes/orden.component.html',
            directives: [documento_component_1.DocumentoComponent, titulo_component_1.TituloComponent],
        }), 
        __metadata('design:paramtypes', [orden_service_1.OrdenService])
    ], OrdenComponent);
    return OrdenComponent;
}());
exports.OrdenComponent = OrdenComponent;
//# sourceMappingURL=orden.component.js.map