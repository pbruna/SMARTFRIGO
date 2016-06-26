import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { OrdenDeSalida, EstadosOrden, ItemDespacho, Bulto} from '../objetos';
import Globals = require('../globals');

@Injectable()
export class OrdenService {

    constructor(private http: Http) { }

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
}




