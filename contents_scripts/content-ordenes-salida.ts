import { OrdenDeSalida, EstadosOrden, ItemDespacho, Bulto, MinDTE } from '../app/objetos';
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Scheduler } from 'rxjs/Scheduler'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/max'
import 'rxjs/add/operator/toArray'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/forkJoin'
import 'rxjs/add/observable/of'

let cliente: {
    rut: string,
    fantasia: string,
    Campos: {
        defontana: {
            credenciales: {
                idEmpresa: string,
                idUsuario: string,
                password: string
            },
            separarXImpuesto: boolean,
            sesion: sesion,
            url: string,
            impuestos: {
                [codImp: string]: {
                    tasa: number,
                    codigo: string,
                    tipoDocumento: string,
                }
            }
            tipoDocumento: string,
            agregaIdPedido: boolean
        },

    }
}


function addOrdenADeFontanaPedido(os: OrdenDeSalida): Observable<boolean> {
    let itms: { [cod: string]: ItemDespacho } = {};
    os.Items.forEach(it => itms[it.UnidadLog.Codigo] = it)
    let clienteDF: clienteDF
    let folioPedido: number
    let arts: { [cod: string]: articuloDF }
    let itmsOfItes: [ItemDespacho[]]

    function secuencia(itms: { impuesto: string, items: ItemDespacho[] }[], os: OrdenDeSalida, cliDF: clienteDF): Observable<boolean> {

        if (itms.length === 1) return savePedidoEnDeFontana(os, itms[0].items, cliDF, itms[0].impuesto)
        return savePedidoEnDeFontana(os, itms[0].items, cliDF, itms[0].impuesto)
            .flatMap(x => secuencia(itms.slice(1), os, cliDF))

    }
    return Observable
        .of('Iniciando sesión en De Fontana')
        .do(x => sendMessageBackToPage(x))
        .flatMap(x => getDeFontanaSesion())
        .do(x => sendMessageBackToPage('Sesión iniciada correctamente'))
        .flatMap(() => Observable.forkJoin(
            Observable.from(os.Items)
                .do(it => sendMessageBackToPage(`Confirmando existencia de ${it.UnidadLog.Codigo} ${it.UnidadLog.Nombre}`))
                .flatMap(it => getArticuloDeFontana(it.UnidadLog.Codigo))
                .do(art => { if (art === 'string') sendMessageBackToPage(`Creando artículo ${art} ${itms[art].UnidadLog.Nombre}`) })
                .flatMap(art => typeof art === 'string'
                    ? addArticuloADeFontana(itms[art])
                        .do(art => sendMessageBackToPage(`OBSERVACIÓN:Se ha creado el artículo ${art.Codigo} ${itms[art.Codigo].UnidadLog.Nombre}`))
                    : Observable.of(art))
                .do(art => sendMessageBackToPage(`Artículo ${art.Codigo} ${itms[art.Codigo].UnidadLog.Nombre} confirmado`))
                .do(art => itms[art.Codigo].UnidadLog.unidaddf = art.Unidad)
                .toArray(),
            Observable.of(os.Cliente.RUT)
                .do(x => sendMessageBackToPage('Obteniendo datos de cliente'))
                .flatMap(rut => getClienteDeFontana(rut))
                .do(x => sendMessageBackToPage('Obteniendo datos de contacto para cliente'))
                .flatMap(x => getContactoClienteDeFontana(x))
                .do(x => sendMessageBackToPage('Cliente Obtenido correctamente')))
            .do(x => clienteDF = x[1])
            .map(x => <{ [codImp: string]: ItemDespacho[] }>
                (cliente.Campos.defontana.separarXImpuesto && !os.Cliente.EsRet5PorCarne
                    ? os.Items.reduce((acc, it) => {
                        if (it.Bultos.length > 0)
                            acc[it.UnidadLog.Impuesto] = (acc[it.UnidadLog.Impuesto] || []).concat([it])
                        return acc
                    }, <{ [imp: string]: ItemDespacho[] }>{})
                    : { '': os.Items.filter(it => it.Bultos.length > 0) }))
            .do(x => sendMessageBackToPage(`Creando ${Object.keys(x).length} pedido${Object.keys(x).length === 1 ? '' : 's'}`))
            .map(x => Object.keys(x).reduce((arr, key) => {
                arr.push({ impuesto: key, items: x[key] })
                return arr
            }, <{ impuesto: string, items: ItemDespacho[] }[]>[]))
            .do(x => x.forEach(itm => {
                if (itm.impuesto in cliente.Campos.defontana.impuestos) return
                throw `El impuesto definido en ${itm.items[0].UnidadLog.Nombre} no tiene documento en DF asociado`
            }))
            .flatMap(x => secuencia(x, os, clienteDF))
            .do(suc => sendMessageBackToPage('Pedidos creados correctamente')))



}

function getDeFontanaSesion(): Observable<sesion> {
    return Observable.create((obs: Observer<sesion>) => {

        if (cliente.Campos.defontana.sesion) {
            obs.next(cliente.Campos.defontana.sesion);
            obs.complete();
            return;
        }

        let xhr = new XMLHttpRequest()
        xhr.open('post', cliente.Campos.defontana.url + '/VENTAS_SOAP/VentaService.svc')
        xhr.setRequestHeader('Content-Type', 'application/soap+xml;charset=UTF-8')
        xhr.responseType = 'document'
        xhr.onload = () => {
            try {
                if (xhr.status !== 200)
                    return sendError(obs, xhr)

                if (xhr.responseXML.getElementsByTagName('LoginResult').item(0).childNodes.length > 0) {
                    let ns = 'http://schemas.datacontract.org/2004/07/WS.Core'
                    cliente.Campos.defontana.sesion = {
                        IDCliente: xhr.responseXML.getElementsByTagNameNS(ns, 'IDCliente').item(0).textContent,
                        IDEmpresa: xhr.responseXML.getElementsByTagNameNS(ns, 'IDEmpresa').item(0).textContent,
                        IDSesion: xhr.responseXML.getElementsByTagNameNS(ns, 'IDSesion').item(0).textContent,
                        IDUsuario: xhr.responseXML.getElementsByTagNameNS(ns, 'IDUsuario').item(0).textContent,
                    }
                    obs.next(cliente.Campos.defontana.sesion);
                } else obs.error('No se pudo iniciar sesión')
            } catch (e) {
                obs.error(e)
            }
            obs.complete();

        }
        xhr.onerror = e => {
            obs.error(e)
            obs.complete();
        }
        xhr.send(`<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="VentaServicio">
        <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">
            <wsa:To>${cliente.Campos.defontana.url}/VENTAS_SOAP/VentaService.svc</wsa:To>
            <wsa:Action>VentaServicio/VentaServicio/Login</wsa:Action>
        </soap:Header>
        <soap:Body>
     
            <tem:Login>
                <tem:idEmpresa>${cliente.Campos.defontana.credenciales.idEmpresa}</tem:idEmpresa>
                <tem:idUsuario>${cliente.Campos.defontana.credenciales.idUsuario}</tem:idUsuario>
                <tem:password>${cliente.Campos.defontana.credenciales.password}</tem:password>
                <tem:ipOrigen></tem:ipOrigen>
            </tem:Login>    
        </soap:Body>
        </soap:Envelope>`)
    })
}

function addArticuloADeFontana(item: ItemDespacho): Observable<articuloDF> {
    return getDeFontanaSesion()
        .flatMap(sesion => Observable.create((obs: Observer<articuloDF>) => {
            let art: articuloDF = {
                Descripcion: item.UnidadLog.Nombre,
                DescripcionDetallada: item.UnidadLog.Descripcion,
                Codigo: item.UnidadLog.Codigo,
                Unidad: item.UnidadLog.TipoUnidad == 1 ? 'Kg' : item.UnidadLog.NomUnidad || 'Uni'
            }

            let xhr = new XMLHttpRequest()
            xhr.open('post', cliente.Campos.defontana.url + '/VENTAS_SOAP/VentaService.svc')
            xhr.setRequestHeader('Content-Type', 'application/soap+xml;charset=UTF-8')
            xhr.responseType = 'document'
            xhr.onload = () => {
                try {
                    if (xhr.status !== 200)
                        return sendError(obs, xhr)

                    xhr.responseXML.getElementsByTagName('GrabaProductoResult').item(0);
                    obs.next(art);
                } catch (e) {
                    obs.error(`No se pudo guardar el item ${item.UnidadLog.Codigo} ${item.UnidadLog.Nombre}`)
                }

                obs.complete();

            }
            xhr.onerror = e => {
                obs.error(e)
                obs.complete();
            }

            xhr.send(`
            <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ven="VentaServicio"
                xmlns:ws="http://schemas.datacontract.org/2004/07/WS.Core"
                xmlns:def="http://schemas.datacontract.org/2004/07/Def.Erp.Venta.DistributedServices.Core.DTO">
                <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">
                    <wsa:Action>VentaServicio/VentaServicio/GrabaProducto</wsa:Action>
                    <wsa:To>${cliente.Campos.defontana.url}/VENTAS_SOAP/VentaService.svc</wsa:To>
                </soap:Header>
                <soap:Body>
                    <ven:GrabaProducto>
                        <ven:sesion>
                            <ws:IDCliente>${sesion.IDCliente}</ws:IDCliente>
                            <ws:IDEmpresa>${sesion.IDEmpresa}</ws:IDEmpresa>
                            <ws:IDSesion>${sesion.IDSesion}</ws:IDSesion>
                            <ws:IDUsuario>${sesion.IDUsuario}</ws:IDUsuario>
                        </ven:sesion>
                        <ven:producto>
                            <def:Codigo>${art.Codigo}</def:Codigo>
                            <def:CodigoExterno></def:CodigoExterno>
                            <def:CodigoInterno></def:CodigoInterno>
                            <def:Descripcion>${art.Descripcion}</def:Descripcion>
                            <def:DescripcionDetallada></def:DescripcionDetallada>
                            <def:IDEmpresa>${sesion.IDEmpresa}</def:IDEmpresa>
                            <def:IDMoneda>PESO</def:IDMoneda>
                            <def:Unidad>${art.Unidad}</def:Unidad>
                        </ven:producto>
                    </ven:GrabaProducto>
                </soap:Body>
            </soap:Envelope>`)
        }))
}

function getArticuloDeFontana(codigo: string): Observable<articuloDF | string> {
    return getDeFontanaSesion()
        .flatMap(sesion => Observable.create((obs: Observer<articuloDF | string>) => {
            let xhr = new XMLHttpRequest()
            xhr.open('post', cliente.Campos.defontana.url + '/SID/Service.svc')
            xhr.setRequestHeader('Content-Type', 'application/soap+xml;charset=UTF-8')
            xhr.responseType = 'document'
            xhr.onload = () => {
                try {
                    if (xhr.status !== 200)
                        return sendError(obs, xhr)

                    let artRep = xhr.responseXML.getElementsByTagName('ConsultaArticulosResult').item(0)
                    let ns = 'http://schemas.datacontract.org/2004/07/WS.Inventario'
                    if (artRep.childNodes.length > 0) obs.next({
                        Codigo: codigo,
                        Descripcion: artRep.getElementsByTagNameNS(ns, 'Descripcion').item(0).textContent,
                        DescripcionDetallada: artRep.getElementsByTagNameNS(ns, 'DescripcionDetallada').item(0).textContent,
                        Unidad: artRep.getElementsByTagNameNS(ns, 'IDUnidadMedida').item(0).textContent
                    })
                    else obs.next(codigo)
                } catch (e) {
                    obs.error(e)
                }

                obs.complete();
            }
            xhr.onerror = e => {
                obs.error(e)
                obs.complete();
            }
            xhr.send(`
            <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/"
                xmlns:ws="http://schemas.datacontract.org/2004/07/WS.Core" >
                <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">
                    <wsa:Action>http://tempuri.org/IService/ConsultaArticulos</wsa:Action>
                    <wsa:To>${cliente.Campos.defontana.url}/SID/Service.svc</wsa:To>
                </soap:Header>
                <soap:Body>
                    <tem:ConsultaArticulos>
                        <tem:sesion>
                            <ws:IDCliente>${sesion.IDCliente}</ws:IDCliente>
                            <ws:IDEmpresa>${sesion.IDEmpresa}</ws:IDEmpresa>
                            <ws:IDSesion>${sesion.IDSesion}</ws:IDSesion>
                            <ws:IDUsuario>${sesion.IDUsuario}</ws:IDUsuario>
                        </tem:sesion>
                        <tem:codigo>${codigo}</tem:codigo>
                    </tem:ConsultaArticulos>
                </soap:Body>
            </soap:Envelope>`)
        }))
}

function getClienteDeFontana(rut: string): Observable<clienteDF> {
    return getDeFontanaSesion()
        .flatMap(sesion => Observable.create((obs: Observer<clienteDF>) => {
            let xhr = new XMLHttpRequest()
            xhr.open('post', cliente.Campos.defontana.url + '/SID/Service.svc')
            xhr.setRequestHeader('Content-Type', 'application/soap+xml;charset=UTF-8')
            xhr.responseType = 'document'
            xhr.onload = () => {
                if (xhr.status !== 200)
                    return sendError(obs, xhr)

                try {
                    let elem = xhr.responseXML.getElementsByTagName('ConsultaClientesPorCodLegalResult').item(0)
                    let ns = 'http://schemas.datacontract.org/2004/07/WS.Ventas'
                    if (elem.childNodes.length > 0) obs.next({
                        Rut: rut,
                        Razon: elem.getElementsByTagNameNS(ns, 'Nombre').item(0).textContent,
                        IDCondicionPago: elem.getElementsByTagNameNS(ns, 'IDCondicionPago').item(0).textContent,
                        IDRubro: elem.getElementsByTagNameNS(ns, 'IDRubro').item(0).textContent,
                        IDVendedor: elem.getElementsByTagNameNS(ns, 'IDVendedor').item(0).textContent,
                        IDFicha: elem.getElementsByTagNameNS(ns, 'IDFichaCliente').item(0).textContent
                    });
                    else obs.error('Cliente no existe en De Fontana')
                } catch (e) {
                    obs.error(e)
                }

                obs.complete();

            }
            xhr.onerror = e => {
                obs.error(e)
                obs.complete();
            }
            xhr.send(`<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/"
                xmlns:ws="http://schemas.datacontract.org/2004/07/WS.Core" >
                <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">
                    <wsa:To>${cliente.Campos.defontana.url}/SID/Service.svc</wsa:To>
                    <wsa:Action>http://tempuri.org/IService/ConsultaClientesPorCodLegal</wsa:Action>
                    </soap:Header>
                <soap:Body>
                    <tem:ConsultaClientesPorCodLegal>
                        <tem:sesion>
                            <ws:IDCliente>${sesion.IDCliente}</ws:IDCliente>
                            <ws:IDEmpresa>${sesion.IDEmpresa}</ws:IDEmpresa>
                            <ws:IDSesion>${sesion.IDSesion}</ws:IDSesion>
                            <ws:IDUsuario>${sesion.IDUsuario}</ws:IDUsuario>
                        </tem:sesion>
                        <tem:codigoLegal>${rut}</tem:codigoLegal>
                    </tem:ConsultaClientesPorCodLegal>
                </soap:Body>
            </soap:Envelope>`)
        }))
}

function getContactoClienteDeFontana(cliDF: clienteDF): Observable<clienteDF> {
    return getDeFontanaSesion()
        .flatMap(sesion => Observable.create((obs: Observer<clienteDF>) => {
            let xhr = new XMLHttpRequest()
            xhr.open('post', cliente.Campos.defontana.url + '/SID/Service.svc')
            xhr.setRequestHeader('Content-Type', 'application/soap+xml;charset=UTF-8')
            xhr.responseType = 'document'
            xhr.onload = () => {
                if (xhr.status !== 200)
                    return sendError(obs, xhr)

                try {
                    let elem = xhr.responseXML.getElementsByTagName('GetContactosFichaClienteResult').item(0);
                    let ns = 'http://schemas.datacontract.org/2004/07/WS.Ventas'
                    if (elem.childNodes.length > 0) {
                        cliDF.Rut = elem.getElementsByTagNameNS(ns, 'IDFichaCliente').item(0).textContent
                        cliDF.IDContactoFicha = elem.getElementsByTagNameNS(ns, 'IDContacto').item(0).textContent
                        obs.next(cliDF)
                    } else obs.error('No se ha encontrado ningún contacto para el cliente')
                } catch (e) {
                    obs.error(e)
                }

                obs.complete();

            }
            xhr.onerror = e => {
                obs.error(e)
                obs.complete();
            }
            xhr.send(`<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                xmlns:tem="http://tempuri.org/"
                xmlns:ws1="http://schemas.datacontract.org/2004/07/WS.Ventas"
                xmlns:ws="http://schemas.datacontract.org/2004/07/WS.Core" >
                <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">
                    <wsa:To>${cliente.Campos.defontana.url}/SID/Service.svc</wsa:To>
                    <wsa:Action>http://tempuri.org/IService/GetContactosFichaCliente</wsa:Action>
                    </soap:Header>
                <soap:Body>
                    <tem:GetContactosFichaCliente>
                        <tem:sesion>
                            <ws:IDCliente>${sesion.IDCliente}</ws:IDCliente>
                            <ws:IDEmpresa>${sesion.IDEmpresa}</ws:IDEmpresa>
                            <ws:IDSesion>${sesion.IDSesion}</ws:IDSesion>
                            <ws:IDUsuario>${sesion.IDUsuario}</ws:IDUsuario>
                        </tem:sesion>
                        <tem:fichaCliente>
                            <ws1:CodigoLegal></ws1:CodigoLegal>
                            <ws1:Direccion></ws1:Direccion>
                            <ws1:Distrito></ws1:Distrito>
                            <ws1:EMail></ws1:EMail>
                            <ws1:Estado></ws1:Estado>
                            <ws1:Fax></ws1:Fax>
                            <ws1:Giro></ws1:Giro>
                            <ws1:IDCondicionPago></ws1:IDCondicionPago>
                            <ws1:IDEmpresa>${sesion.IDEmpresa}</ws1:IDEmpresa>
                            <ws1:IDFichaCliente>${cliDF.IDFicha}</ws1:IDFichaCliente>
                            <ws1:IDListaPrecio></ws1:IDListaPrecio>
                            <ws1:IDLocal></ws1:IDLocal>
                            <ws1:IDMoneda></ws1:IDMoneda>
                            <ws1:IDProducto></ws1:IDProducto>
                            <ws1:IDRubro></ws1:IDRubro>
                            <ws1:IDTipoDocumento></ws1:IDTipoDocumento>
                            <ws1:IDVendedor></ws1:IDVendedor>
                            <ws1:IdTipoIdentificacion></ws1:IdTipoIdentificacion>
                            <ws1:IdTipoPersona></ws1:IdTipoPersona>
                            <ws1:Nombre></ws1:Nombre>
                        </tem:fichaCliente>
                    </tem:GetContactosFichaCliente>
                </soap:Body>
            </soap:Envelope>`)
        }))
}

function savePedidoEnDeFontana(os: OrdenDeSalida, items: ItemDespacho[], cliDF: clienteDF, impuesto: string): Observable<boolean> {
    os.FechaIngreso = new Date(os.FechaIngreso)
    os.FechaDespacho = new Date(os.FechaDespacho)
    items.forEach(it => it.facturado = Math.round(100 * it.Bultos.reduce((ac, b) => ac +
        (b.UnidadLogistica.TipoUnidad === 1 ? b.PesoInformado || (b.PesoNeto - (b.Tara || 0)) : b.UnidadLogistica.Unidades || 1), 0)) / 100)
    return getDeFontanaSesion()
        .flatMap(sesion => Observable.create((obs: Observer<boolean>) => {
            let xhr = new XMLHttpRequest()
            xhr.open('post', cliente.Campos.defontana.url + '/SID/Service.svc')
            xhr.setRequestHeader('Content-Type', 'application/soap+xml;charset=UTF-8')
            xhr.responseType = 'document'
            xhr.onload = () => {
                if (xhr.status !== 200)
                    return sendError(obs, xhr)

                let art: { Rut: string, Razon: string }
                try {
                    xhr.responseXML.getElementsByTagName('GrabaPedidoResultRetorno').item(0);
                    obs.next(true);
                } catch (e) {
                    return obs.error(e)
                }
                obs.complete();
            }
            xhr.onerror = e => obs.error(e)
            let afecto = items.reduce((acc, it) => acc + Math.round(+(it.facturado * it.Precio).toFixed(2)), 0)
            xhr.send(`<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/"
                xmlns:dom="http://schemas.datacontract.org/2004/07/Dominio.General.Entidades"
                xmlns:ws="http://schemas.datacontract.org/2004/07/WS.Core"
                xmlns:ws1="http://schemas.datacontract.org/2004/07/WS.Ventas">
                <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">
                    <wsa:To>${cliente.Campos.defontana.url}/SID/Service.svc</wsa:To>
                    <wsa:Action>http://tempuri.org/IService/GrabaPedidoRetorno</wsa:Action>
                    </soap:Header>
                <soap:Body>
                    <tem:GrabaPedidoRetorno>
                        <tem:sesion>
                            <ws:IDCliente>${sesion.IDCliente}</ws:IDCliente>
                            <ws:IDEmpresa>${sesion.IDEmpresa}</ws:IDEmpresa>
                            <ws:IDSesion>${sesion.IDSesion}</ws:IDSesion>
                            <ws:IDUsuario>${sesion.IDUsuario}</ws:IDUsuario>
                        </tem:sesion>
                        <tem:pedido>
                            <ws1:Afecto>${afecto}</ws1:Afecto>${cliente.Campos.defontana.agregaIdPedido ? `
                            <ws1:Campos>
                                <ws1:PedidoCampo>    
                                    <ws1:IDCampo>1</ws1:IDCampo>    
                                    <ws1:Valor>${os.Id}</ws1:Valor>
                                </ws1:PedidoCampo>
                            </ws1:Campos>` : ''}                            
                            <ws1:Detalles>${items.reduce((acc, va, i) => {
                    return acc + `
                               <ws1:PedidoDetalle>    
                                    <ws1:Cantidad>${va.facturado}</ws1:Cantidad>    
                                    <ws1:Comentario>Item en ${va.Bultos ? va.Bultos.length : 0} bultos</ws1:Comentario>    
                                    <ws1:FechaEntrega>${os.FechaDespacho.toISOString().substr(0, 10)}</ws1:FechaEntrega>
                                    <ws1:IDProducto>${va.UnidadLog.Codigo}</ws1:IDProducto>    
                                    <ws1:LineaDetalle>${i + 1}</ws1:LineaDetalle>    
                                    <ws1:PrecioUnitario>${va.Precio || 0}</ws1:PrecioUnitario>
                                    <ws1:SubTotal>${Math.round(+(va.Precio * va.facturado).toFixed(2))}</ws1:SubTotal>    
                                </ws1:PedidoDetalle>`}, '')}
                            </ws1:Detalles>
                            <ws1:EsFacturacionAnticipada>false</ws1:EsFacturacionAnticipada>
                            <ws1:Estado>PENDIENTE</ws1:Estado>
                            <ws1:Exento>0</ws1:Exento>                           
                            <ws1:Fecha>${os.FechaIngreso.toISOString().substr(0, 10)}</ws1:Fecha>
                            <ws1:FechaExpiracion>${new Date(os.FechaIngreso.getTime() + 1000 * 60 * 60 * 24 * 365).toISOString().substr(0, 10)}</ws1:FechaExpiracion>
                            <ws1:IDCondicionPago>${cliDF.IDCondicionPago}</ws1:IDCondicionPago>
                            <ws1:IDContactoFicha>${cliDF.IDContactoFicha}</ws1:IDContactoFicha>
                            <ws1:IDEmpresa>ANDESMEAT</ws1:IDEmpresa>
                            <ws1:IDFichaCliente>${cliDF.IDFicha}</ws1:IDFichaCliente>
                            <ws1:IDListaPrecio>1</ws1:IDListaPrecio>
                            <ws1:IDLocal>Local</ws1:IDLocal>
                            <ws1:IDMonedaIngreso>PESO</ws1:IDMonedaIngreso>
                            <ws1:IDTipoDocumento>${cliente.Campos.defontana.impuestos[impuesto].tipoDocumento}</ws1:IDTipoDocumento>
                            <ws1:IDVendedor>${cliDF.IDVendedor}</ws1:IDVendedor>
                            <ws1:Impuestos>
                            <dom:DetalleImpuesto>
                                <dom:IDImpuesto>IVA</dom:IDImpuesto>
                                <dom:MontoImpuesto>${Math.round(+(afecto * 0.19).toFixed(2))}</dom:MontoImpuesto>
                                <dom:PorcentajeImpuesto>19</dom:PorcentajeImpuesto>
                            </dom:DetalleImpuesto>${impuesto === '' ? '' : `
                            <dom:DetalleImpuesto>
                                <dom:IDImpuesto>${cliente.Campos.defontana.impuestos[impuesto].codigo}</dom:IDImpuesto>
                                <dom:MontoImpuesto>${Math.round(+(afecto * cliente.Campos.defontana.impuestos[impuesto].tasa).toFixed(2))}</dom:MontoImpuesto>
                                <dom:PorcentajeImpuesto>${cliente.Campos.defontana.impuestos[impuesto].tasa * 100}</dom:PorcentajeImpuesto>
                            </dom:DetalleImpuesto>`}
                            </ws1:Impuestos>                            
                            <ws1:Numero>0</ws1:Numero>
                            <ws1:ObservacionDespacho>${os.Direccion}</ws1:ObservacionDespacho>
                            <ws1:ObservacionFacturacion>Total Bultos ${items.reduce((acc, it) => acc + (it.Bultos ? it.Bultos.length : 0), 0).toLocaleString()}
Total Cantidad ${items.reduce((acc, it) => acc + it.facturado, 0).toLocaleString()}
                            </ws1:ObservacionFacturacion>
                            <ws1:ObservacionGeneral></ws1:ObservacionGeneral>
                            <ws1:ObservacionPrestacion></ws1:ObservacionPrestacion>
                            <ws1:RecargoDescuento>0</ws1:RecargoDescuento>
                            <ws1:Subtotal>${afecto}</ws1:Subtotal>
                            <ws1:Total>${afecto + Math.round(+(afecto * 0.19).toFixed(2)) + Math.round(+(afecto * cliente.Campos.defontana.impuestos[impuesto].tasa || 0).toFixed(2))}</ws1:Total>
                        </tem:pedido>
                    </tem:GrabaPedidoRetorno>
                </soap:Body>
            </soap:Envelope>`)
        }))
}

function sendMessageBackToPage(msg: string) {
    document.dispatchEvent(new CustomEvent('EnviarMensaje', { detail: msg }))
}

function sendError(obs: Observer<any>, xhr: XMLHttpRequest) {
    let ns = 'http://www.w3.org/2003/05/soap-envelope'
    let el = xhr.responseXML.getElementsByTagNameNS(ns, 'Message').item(0)
    if (!el) el = xhr.responseXML.getElementsByTagNameNS(ns, 'Text').item(0)
    obs.error(el.textContent)
}




document.addEventListener('EnviarOSaDeFontana', (e: any) => {
    let Orden = e.detail.Orden;
    cliente = e.detail.Cliente

    addOrdenADeFontanaPedido(Orden).subscribe(
        nxt => sendMessageBackToPage('Operación finalizada correctamente'),
        err => sendMessageBackToPage('ERROR: No se ha podido completar la operación\nERROR: ' + err)
    )

});

interface sesion {
    IDCliente: string,
    IDEmpresa: string,
    IDSesion: string,
    IDUsuario: string
}

interface clienteDF {
    Rut: string,
    Razon: string,
    IDCondicionPago: string,
    IDRubro: string,
    IDVendedor: string,
    IDContactoFicha?: string,
    IDFicha: string
}

interface articuloDF {
    Descripcion: string,
    DescripcionDetallada: string,
    Codigo: string,
    Unidad: string
}