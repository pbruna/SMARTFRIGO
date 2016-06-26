
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

    NumDocto: number;
    NombreDocto: string;

    Direccion: string;
    NombreDestino: string;

    LatLng: any;
    GeoCodeStatus: string;

    ToDTE = function (): string {
        return '';
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

    getCantidad(): number {
        if (!this.Bultos) return this.Cantidad * (this.UnidadLog.Unidades || 1);
        return this.Bultos.reduce((vp, b) => vp += b.Cantidad(), 0);
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

}

export class Documento {
    Id: string;
    IdOrden: string;
    Nombre: string;
}