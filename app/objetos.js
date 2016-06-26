"use strict";
var OrdenDeSalida = (function () {
    function OrdenDeSalida() {
        this.ToDTE = function () {
            return '';
        };
    }
    return OrdenDeSalida;
}());
exports.OrdenDeSalida = OrdenDeSalida;
(function (EstadosOrden) {
    EstadosOrden[EstadosOrden["Ingresada"] = 0] = "Ingresada";
    EstadosOrden[EstadosOrden["Cerrada"] = 1] = "Cerrada";
    EstadosOrden[EstadosOrden["Eliminada"] = 2] = "Eliminada";
    EstadosOrden[EstadosOrden["Preparada"] = 3] = "Preparada";
    EstadosOrden[EstadosOrden["Editandose"] = 4] = "Editandose";
})(exports.EstadosOrden || (exports.EstadosOrden = {}));
var EstadosOrden = exports.EstadosOrden;
;
var ItemDespacho = (function () {
    function ItemDespacho() {
    }
    ItemDespacho.prototype.getCantidad = function () {
        if (!this.Bultos)
            return this.Cantidad * (this.UnidadLog.Unidades || 1);
        return this.Bultos.reduce(function (vp, b) { return vp += b.Cantidad(); }, 0);
    };
    return ItemDespacho;
}());
exports.ItemDespacho = ItemDespacho;
var Bulto = (function () {
    function Bulto() {
    }
    Bulto.prototype.Cantidad = function () {
        if (this.UnidadLogistica.TipoUnidad) {
            if (this.UnidadLogistica.TipoUnidad == 1)
                return this.PesoNeto ? this.PesoNeto - (this.Tara || 0) : this.PesoInformado || 0;
            else {
                if (this.UnidadLogistica.Unidades == 0)
                    return 1;
                return this.UnidadLogistica.Unidades;
            }
        }
        else
            return 1;
    };
    return Bulto;
}());
exports.Bulto = Bulto;
var UnidadLogistica = (function () {
    function UnidadLogistica() {
    }
    return UnidadLogistica;
}());
exports.UnidadLogistica = UnidadLogistica;
var Documento = (function () {
    function Documento() {
    }
    return Documento;
}());
exports.Documento = Documento;
//# sourceMappingURL=objetos.js.map