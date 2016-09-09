"use strict";
var OrdenDeSalida = (function () {
    function OrdenDeSalida() {
        this.OnInit = function () {
            this.FechaIngreso = new Date(this.FechaIngreso);
            this.FechaDespacho = new Date(this.FechaDespacho);
            this.Estado = EstadosOrden[this.Estado];
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
    ItemDespacho.prototype.getCantidad = function (estado) {
        switch (estado) {
            case EstadosOrden.Preparada:
            case EstadosOrden.Cerrada:
                return this.Bultos.reduce(function (vp, b) { return vp += b.Cantidad(); }, 0);
            default:
                if (this.Bultos.length == 0)
                    return this.Cantidad * (this.UnidadLog.Unidades || 1);
                return this.Bultos.reduce(function (vp, b) { return vp += b.Cantidad(); }, 0);
        }
    };
    return ItemDespacho;
}());
exports.ItemDespacho = ItemDespacho;
var Bulto = (function () {
    function Bulto() {
    }
    Bulto.prototype.Cantidad = function () {
        if (this.UnidadLogistica.TipoUnidad === 1)
            return this.PesoNeto ? this.PesoNeto - (this.Tara || 0) : this.PesoInformado || 0;
        else {
            if (this.UnidadLogistica.Unidades === 0)
                return 1;
            return this.UnidadLogistica.Unidades || 1;
        }
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
var MinDTE = (function () {
    function MinDTE() {
    }
    MinDTE.prototype.loadFromOrden = function (orden, itms) {
        var _this = this;
        var f = new Date(orden.FechaDespacho.getTime());
        if (orden.Cliente) {
            this.vencimiento = (new Date(f.getFullYear(), f.getMonth(), f.getDate() + orden.Cliente.Plazo)).toISOString();
            this.condicion = orden.Cliente.Condicion;
            this.retenedorIVACarne = orden.Cliente.EsRet5PorCarne;
            this.RUT = orden.Cliente.RUT.substr(0, orden.Cliente.RUT.length - 2);
            this.RUT_DV = orden.Cliente.RUT.substr(orden.Cliente.RUT.length - 1, 1);
        }
        this.emision = orden.FechaDespacho.toISOString();
        var totBultos = 0;
        if (!itms)
            itms = orden.Items;
        this.items = [];
        var PesoNeto = 0;
        itms.forEach(function (itm) {
            var mdi = new MinDTEItem();
            mdi.loadFromItem(itm, orden.Estado);
            if (mdi.cantidad !== 0) {
                PesoNeto += Math.round(itm.getCantidad(EstadosOrden.Preparada) * 100) / 100;
                _this.items.push(mdi);
                totBultos += mdi.bultos;
            }
        });
        var lastDesc = '\nTotal de bultos del documento: ' + totBultos.toLocaleString();
        if (PesoNeto > 0)
            lastDesc += ' - Peso Neto Total: ' + PesoNeto.toLocaleString();
        lastDesc += '. Orden N°: ' + orden.Numero;
        this.items.slice(-1)[0].descripcion += lastDesc;
    };
    return MinDTE;
}());
exports.MinDTE = MinDTE;
var MinDTEItem = (function () {
    function MinDTEItem() {
    }
    MinDTEItem.prototype.loadFromItem = function (i, estado) {
        if (!i.UnidadLog.Unidades || i.UnidadLog.Unidades == 0)
            i.UnidadLog.Unidades = 1;
        this.cantidad = i.getCantidad(estado);
        this.bultos = i.Bultos.length > 0 ? i.Bultos.length : i.Cantidad;
        this.descripcion = 'Item en ' + this.bultos + ' bulto' + (this.bultos > 1 ? 's' : '');
        this.codigo = i.UnidadLog.Codigo;
        this.nombre = i.UnidadLog.Descripcion ? i.UnidadLog.Descripcion : i.UnidadLog.Nombre;
        this.precio = i.Precio ? i.Precio : i.UnidadLog.Precio;
        this.tipoCod = i.UnidadLog.Codigo ? 'INT' : null;
        this.unidad = i.UnidadLog.TipoUnidad == 1 && i.Bultos.length > 0 ? 'Kg' : (i.UnidadLog.NomUnidad || 'Uni.');
        this.impuesto = i.UnidadLog.Impuesto;
        if (this.cantidad < 1 && this.cantidad > 0) {
            var pq = Math.round(Math.round(this.cantidad * 100) / 100 * Math.round(this.precio * 100)) / 100;
            var i_1 = 3;
            while (pq !== Math.round(Math.round(this.cantidad * 100 * Math.pow(10, i_1)) / 100 * Math.round(this.precio * 100) / Math.pow(10, i_1)) / 100) {
                --i_1;
                if (i_1 === 0)
                    break;
            }
            if (i_1 !== 0) {
                this.cantidad *= Math.pow(10, i_1);
                this.precio /= Math.pow(10, i_1);
                if (i_1 === 3)
                    this.unidad = 'g';
                else
                    this.unidad = '-';
            }
        }
    };
    return MinDTEItem;
}());
exports.MinDTEItem = MinDTEItem;
var Cliente = (function () {
    function Cliente() {
    }
    return Cliente;
}());
exports.Cliente = Cliente;
//# sourceMappingURL=objetos.js.map