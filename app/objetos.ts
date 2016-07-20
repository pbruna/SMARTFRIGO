
export class OrdenDeSalida {
    Id: string;
    IdEmpresa: string;
    IdCliente: string;
    Numero: number;
    FolioCliente: number;
    Estado: EstadosOrden;
    FechaIngreso: Date;
    FechaDespacho: Date;
    Items: ItemDespacho[];
    Documentos: Documento[];

    Cliente: Cliente

    NumDocto: number;
    NombreDocto: string;

    Direccion: string;
    NombreDestino: string;

    LatLng: any;
    GeoCodeStatus: string;

    ToDTE = function (): string {
        return '';
    }

    OnInit = function () {
        this.FechaIngreso = new Date(this.FechaIngreso);
        this.FechaDespacho = new Date(this.FechaDespacho);
    }

}
export enum EstadosOrden { Ingresada, Cerrada, Eliminada, Preparada, Editandose };


export class ItemDespacho {
    Id: string;
    NombreRef: string;
    UnidadLog: UnidadLogistica;
    Cantidad: number;
    Bultos: Bulto[];
    checked: boolean;
    Precio: number

    getCantidad(estado: EstadosOrden): number {
        switch (estado) {
            case EstadosOrden.Preparada, EstadosOrden.Cerrada:
                return this.Bultos.reduce((vp, b) => vp += b.Cantidad(), 0);
            default:
                if (this.Bultos.length == 0) return this.Cantidad * (this.UnidadLog.Unidades || 1);
                return this.Bultos.reduce((vp, b) => vp += b.Cantidad(), 0);
        }
    }


}

export class Bulto {
    Id: string;
    UnidadLogistica: UnidadLogistica;
    PesoInformado: number;
    PesoNeto: number;
    Tara: number;

    Cantidad(): number {
        if (this.UnidadLogistica.TipoUnidad) {
            if (this.UnidadLogistica.TipoUnidad == 1)
                return this.PesoNeto ? this.PesoNeto - (this.Tara || 0) : this.PesoInformado || 0;
            else {
                if (this.UnidadLogistica.Unidades == 0) return 1
                return this.UnidadLogistica.Unidades
            }
        } else
            return 1
    }

}

export class UnidadLogistica {

    Id: string;
    Nombre: string;
    Descripcion: string;
    Unidades: number;
    TipoUnidad: number;
    NomUnidad: string;
    Impuesto: string;
    Codigo: string;
    Precio: number

}

export class Documento {
    Id: string;
    IdOrden: string;
    Nombre: string;
}

export class MinDTE {
    RUT: string
    RUT_DV: string
    direccion: string
    vencimiento: string
    emision: string
    condicion: string
    retenedorIVACarne: boolean
    soloTraslado: boolean
    items: MinDTEItem[];

    loadFromOrden(orden: OrdenDeSalida, itms: ItemDespacho[]) {
        let f = new Date(orden.FechaDespacho.getTime());
        this.vencimiento = (new Date(f.getFullYear(), f.getMonth(), f.getDate() + orden.Cliente.Plazo)).toISOString();
        this.emision = orden.FechaDespacho.toISOString();
        this.condicion = orden.Cliente.Condicion;
        this.retenedorIVACarne = orden.Cliente.EsRet5PorCarne;
        this.RUT = orden.Cliente.RUT.substr(0, orden.Cliente.RUT.length - 2);
        this.RUT_DV = orden.Cliente.RUT.substr(orden.Cliente.RUT.length - 1, 1);

        let totBultos = 0;
        if (!itms) itms = orden.Items;
        this.items = [];
        itms.forEach(itm => {
            let mdi = new MinDTEItem();
            mdi.loadFromItem(itm, orden.Estado)
            if (mdi.cantidad !== 0) {
                this.items.push(mdi)
                totBultos += mdi.bultos
            }
        })
        this.items.slice(-1)[0].descripcion += '\nTotal de bultos del documento: ' + totBultos.toLocaleString();
    }

}

export class MinDTEItem {
    cantidad: number
    descripcion: string
    codigo: string
    nombre: string
    precio: number
    tipoCod: string
    unidad: string
    impuesto: string
    bultos: number


    loadFromItem(i: ItemDespacho, estado: EstadosOrden) {
        if (!i.UnidadLog.Unidades || i.UnidadLog.Unidades == 0) i.UnidadLog.Unidades = 1;

        this.cantidad = i.getCantidad(estado)
        this.descripcion = 'Item en ' + (i.Bultos.length > 0 ? i.Bultos.length : i.Cantidad) + ' bultos'
        this.codigo = i.UnidadLog.Codigo
        this.nombre = i.UnidadLog.Descripcion ? i.UnidadLog.Descripcion : i.UnidadLog.Nombre
        this.precio = i.Precio ? i.Precio : i.UnidadLog.Precio
        if (this.cantidad < 1 && this.cantidad > 0) {
            this.cantidad *= 1000;
            this.precio /= 1000;
        }
        this.tipoCod = i.UnidadLog.Codigo ? 'INT' : null
        this.unidad = i.UnidadLog.TipoUnidad == 1 && i.Bultos.length > 0 ? 'Kg' : (i.UnidadLog.NomUnidad || 'Uni.')
        this.impuesto = i.UnidadLog.Impuesto
        this.bultos = i.Bultos.length > 0 ? i.Bultos.length : i.Cantidad
    }
}

export class Cliente {
    Condicion: string
    RUT: string
    EsRet5PorCarne: boolean
    Plazo: number
}