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
var orden_service_1 = require('../servicios/orden.service');
var documento_component_1 = require('./documento.component');
var titulo_component_1 = require('./titulo.component');
var OrdenComponent = (function () {
    function OrdenComponent(ordenService, routeParams) {
        this.ordenService = ordenService;
        this.routeParams = routeParams;
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
    OrdenComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.routeParams.get('folio') !== null) {
            var folio = +this.routeParams.get('folio');
            this.ordenService.getByFolioCliente(folio)
                .then(function (os) {
                _this.orden = os;
                if (os.Items)
                    _this.checkAll(_this.check);
            });
        }
    };
    OrdenComponent = __decorate([
        core_1.Component({
            selector: 'orden',
            templateUrl: './app/componentes/orden.component.html',
            directives: [documento_component_1.DocumentoComponent, titulo_component_1.TituloComponent],
            animations: [
                core_1.trigger('flyInOut', [
                    core_1.state('in', core_1.style({ transform: 'translateX(0)' })),
                    core_1.transition('void <=> *', [core_1.style({ transform: 'translateX(100%)' }), core_1.animate(10000)])
                ])
            ]
        }), 
        __metadata('design:paramtypes', [orden_service_1.OrdenService, router_deprecated_1.RouteParams])
    ], OrdenComponent);
    return OrdenComponent;
}());
exports.OrdenComponent = OrdenComponent;
//# sourceMappingURL=orden.component.js.map