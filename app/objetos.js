"use strict";
var OrdenDeSalida = (function () {
    function OrdenDeSalida() {
        this.ToDTE = function () {
            return '';
        };
        this.OnInit = function () {
            this.FechaIngreso = new Date(this.FechaIngreso);
            this.FechaDespacho = new Date(this.FechaDespacho);
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
var MinDTE = (function () {
    function MinDTE() {
    }
    MinDTE.prototype.loadFromOrden = function (orden, itms) {
        var _this = this;
        var f = new Date(orden.FechaDespacho.getTime());
        this.vencimiento = (new Date(f.getFullYear(), f.getMonth(), f.getDate() + orden.Cliente.Plazo)).toISOString();
        this.emision = orden.FechaDespacho.toISOString();
        this.condicion = orden.Cliente.Condicion;
        this.retenedorIVACarne = orden.Cliente.EsRet5PorCarne;
        this.RUT = orden.Cliente.RUT.substr(0, orden.Cliente.RUT.length - 2);
        this.RUT_DV = orden.Cliente.RUT.substr(orden.Cliente.RUT.length - 1, 1);
        var totBultos = 0;
        if (!itms)
            itms = orden.Items;
        this.items = [];
        itms.forEach(function (itm) {
            var mdi = new MinDTEItem();
            mdi.loadFromItem(itm);
            _this.items.push(mdi);
            totBultos += itm.Bultos ? itm.Bultos.length : itm.Cantidad;
        });
        this.items.slice(-1)[0].descripcion += '\nTotal de bultos del documento: ' + totBultos.toLocaleString();
    };
    return MinDTE;
}());
exports.MinDTE = MinDTE;
var MinDTEItem = (function () {
    function MinDTEItem() {
    }
    MinDTEItem.prototype.loadFromItem = function (i) {
        if (!i.UnidadLog.Unidades || i.UnidadLog.Unidades == 0)
            i.UnidadLog.Unidades = 1;
        this.cantidad = i.UnidadLog.Unidades * i.getCantidad();
        this.descripcion = 'Item en ' + i.Bultos.length + ' bultos';
        this.codigo = i.UnidadLog.Codigo;
        this.nombre = i.UnidadLog.Descripcion ? i.UnidadLog.Descripcion : i.UnidadLog.Nombre;
        this.precio = i.Precio ? i.Precio : i.UnidadLog.Precio;
        this.tipoCod = i.UnidadLog.Codigo ? 'INT' : null;
        this.unidad = i.UnidadLog.TipoUnidad == 1 ? 'Kg' : (i.UnidadLog.NomUnidad || 'Uni.');
        this.impuesto = i.UnidadLog.Impuesto;
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