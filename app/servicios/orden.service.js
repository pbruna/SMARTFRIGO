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
/// <reference path="../references/chrome.d.ts" />
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
require('rxjs/add/operator/toPromise');
var objetos_1 = require('../objetos');
var Globals = require('../globals');
var OrdenService = (function () {
    function OrdenService(http) {
        this.http = http;
    }
    OrdenService.prototype.getByEstado = function (estado) {
        return this.http.get(Globals.webServiceURL + '/OrdenesDeSalida_GetByEstado?estado=' + objetos_1.EstadosOrden[estado], {
            withCredentials: true
        })
            .toPromise()
            .then(function (response) { return Globals.createAFObject(response.json()); })
            .catch(function (reason) { return reason; });
    };
    OrdenService.prototype.getByFolioCliente = function (Folio) {
        return this.http.get(Globals.webServiceURL + '/OrdenesDeSalida_GetByFolio?folio=' + Folio, {
            withCredentials: true
        })
            .toPromise()
            .then(function (response) {
            var os = Globals.createAFObject(response.json());
            var itms = os.Items;
            itms.forEach(function (i) {
                if (i.Bultos)
                    i.Bultos.forEach(function (b) {
                        b.UnidadLogistica = i.UnidadLog;
                    });
            });
            return os;
        })
            .catch(function (reason) { return reason; });
    };
    OrdenService.prototype.getItemsById = function (Id) {
        return this.http.get(Globals.webServiceURL + '/OrdenesDeSalida_GetItems?id=' + Id, {
            withCredentials: true
        })
            .toPromise()
            .then(function (response) {
            var itms = Globals.createAFObject(response.json());
            itms.forEach(function (i) {
                if (i.Bultos)
                    i.Bultos.forEach(function (b) {
                        b.UnidadLogistica = i.UnidadLog;
                    });
            });
            return itms;
        })
            .catch(function (reason) { return reason; });
    };
    OrdenService.prototype.setCliente = function (orden) {
        if (!orden.IdCliente || orden.IdCliente == '00000000-0000-0000-0000-000000000000')
            return Promise.resolve(orden);
        return this.http.get(Globals.webServiceURL + '/OrdenesDeSalida_GetCliente?IdCliente=' + orden.IdCliente, {
            withCredentials: true
        }).toPromise()
            .then(function (cli) {
            orden.Cliente = cli.json();
            return orden;
        })
            .catch(function (reason) { return reason; });
    };
    OrdenService.prototype.insertOrdenEnFormDTE = function (orden, itms) {
        if (!itms)
            itms = orden.Items;
        this.setCliente(orden)
            .then(function (o) {
            var dte = new objetos_1.MinDTE();
            dte.loadFromOrden(orden, itms);
            chrome.runtime.sendMessage({ op: 'RellenarSIIForm', dte: dte, NumOrden: orden.Numero });
            window.close();
        });
    };
    OrdenService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], OrdenService);
    return OrdenService;
}());
exports.OrdenService = OrdenService;
//# sourceMappingURL=orden.service.js.map