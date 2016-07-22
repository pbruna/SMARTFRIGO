import { Injectable }    from '@angular/core';
import { CustomHttp } from '../HttpExtension';
import { Http } from '@angular/Http';
import { OrdenDeSalida, EstadosOrden, ItemDespacho, Bulto, MinDTE} from '../objetos';
import Globals = require('../globals');
import 'rxjs/add/operator/toPromise';

@Injectable()
export class OrdenService {

    constructor(private http: CustomHttp) { }

    getByEstado(estado: EstadosOrden): Promise<OrdenDeSalida[]> {
        return this.http.get(Globals.webServiceURL + '/OrdenesDeSalida_GetByEstado?estado=' + EstadosOrden[estado], {
            withCredentials: true
        })
            .toPromise()
            .then(response => Globals.createAFObject(<OrdenDeSalida[]>response.json()))
            .catch(reason => reason)
    }

    getByFolioCliente(Folio: number): Promise<OrdenDeSalida> {
        return this.http.get(Globals.webServiceURL + '/OrdenesDeSalida_GetByFolio?folio=' + Folio, {
            withCredentials: true
        })
            .toPromise()
            .then(function (response) {
                var os = Globals.createAFObject(<OrdenDeSalida>response.json())
                var itms = os.Items
                itms.forEach(function (i: ItemDespacho) {
                    if (i.Bultos) i.Bultos.forEach(function (b: Bulto) {
                        b.UnidadLogistica = i.UnidadLog;
                    })
                })
                return os;
            })
            .catch(reason => reason)
    }

    getItemsById(Id: string): Promise<ItemDespacho[]> {
        return this.http.get(Globals.webServiceURL + '/OrdenesDeSalida_GetItems?id=' + Id, {
            withCredentials: true
        })
            .toPromise()
            .then(function (response) {
                var itms = Globals.createAFObject(<ItemDespacho[]>response.json())
                itms.forEach(function (i: ItemDespacho) {
                    if (i.Bultos) i.Bultos.forEach(function (b: Bulto) {
                        b.UnidadLogistica = i.UnidadLog;
                    })
                })
                return itms;
            })
            .catch(reason => reason)
    }

    setCliente(orden: OrdenDeSalida): Promise<OrdenDeSalida> {
        if (!orden.IdCliente || orden.IdCliente == '00000000-0000-0000-0000-000000000000')
            return Promise.resolve<OrdenDeSalida>(orden);

        return this.http.get(Globals.webServiceURL + '/OrdenesDeSalida_GetCliente?IdCliente=' + orden.IdCliente, {
            withCredentials: true
        }).toPromise()
            .then(cli => {
                orden.Cliente = cli.json();
                return orden;
            })
            .catch(reason => reason)

    }

    insertOrdenEnFormDTE(orden: OrdenDeSalida, itms: ItemDespacho[]) {
        if (!itms) itms = orden.Items;

        this.setCliente(orden)
            .then(o => {
                let dte = new MinDTE();
                dte.loadFromOrden(orden, itms);
                chrome.runtime.sendMessage({ op: 'RellenarSIIForm', dte: dte, NumOrden: orden.Numero });
                window.close();
            })
    }
}




