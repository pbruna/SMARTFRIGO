import { Observable, Observer } from 'rxjs'
import { OrdenDeSalida, EstadosOrden, ItemDespacho, Bulto, MinDTE } from '../app/objetos';

let cliente: {
    rut: string,
    fantasia: string,
    campos: {
        defontana: {
            credenciales: {
                idEmpresa: string,
                idUsuario: string,
                password: string
            },
            separarXImpuesto: boolean,
            sesion: sesion

        },

    }
}

= {
        rut: '',
        fantasia: 'Andes Meat',
        campos: {
            defontana: {
                credenciales: {
                    idEmpresa: 'andesmeat',
                    idUsuario: 'integracion',
                    password: '2'
                },
                separarXImpuesto: true,
                sesion: null

            },

        }

    };



interface sesion {
    IDCliente: string,
    IDEmpresa: string,
    IDSesion: string,
    IDUsuario: string
}

function getSesion(): Observable<sesion> {
    return Observable.create((obs: Observer<sesion>) => {

        if (cliente.campos.defontana.sesion) {
            obs.next(cliente.campos.defontana.sesion);
            obs.complete();
            return;
        }

        let xhr = new XMLHttpRequest()
        xhr.open('post', 'https://34.200.105.231/VENTAS_SOAP/VentaService.svc?wsdl')
        xhr.setRequestHeader('Content-Type', 'application/soap+xml;charset=UTF-8')
        xhr.responseType = 'document'
        xhr.onload = () => {
            if (xhr.status !== 200) {
                obs.error(xhr.responseXML.getElementsByTagName('Message').item(1).textContent)
                obs.complete();
                return
            }
            let sesion: sesion
            try {
                sesion = {
                    IDCliente: xhr.responseXML.getElementsByTagName('b:IDCliente').item(0).textContent,
                    IDEmpresa: xhr.responseXML.getElementsByTagName('b:IDEmpresa').item(0).textContent,
                    IDSesion: xhr.responseXML.getElementsByTagName('b:IDSesion').item(0).textContent,
                    IDUsuario: xhr.responseXML.getElementsByTagName('b:IDUsuario').item(0).textContent,
                }
            } catch (e) {
                obs.error(e)
                obs.complete();
                return
            }
            cliente.campos.defontana.sesion = sesion
            obs.next(cliente.campos.defontana.sesion);
            obs.complete();

        }
        xhr.onerror = e => {
            obs.error(e)
            obs.complete();
        }
        xhr.send(`<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="VentaServicio">
        <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">
            <wsa:To>https://34.200.105.231/VENTAS_SOAP/VentaService.svc</wsa:To>
            <wsa:Action>VentaServicio/VentaServicio/Login</wsa:Action>
            </soap:Header>
        <soap:Body>
            <tem:Login>
                <tem:idEmpresa>${cliente.campos.defontana.credenciales.idEmpresa}</tem:idEmpresa>
                <tem:idUsuario>${cliente.campos.defontana.credenciales.idUsuario}</tem:idUsuario>
                <tem:password>${cliente.campos.defontana.credenciales.password}</tem:password>
                <tem:ipOrigen></tem:ipOrigen>
            </tem:Login>    
        </soap:Body>
        </soap:Envelope>`)
    })
}

function addOrden(os: OrdenDeSalida): Observable<boolean> {
    return Observable.create((obs: Observer<boolean>) => {

    })
}

function addArticulo(item: ItemDespacho): Observable<boolean> {
    return Observable.create((obs: Observer<boolean>) => {

    })
}

function getArticulo(codigo: string): Observable<{}> {
    return getSesion()
        .flatMap(sesion => Observable.create((obs: Observer<{}>) => {
            let xhr = new XMLHttpRequest()
            xhr.open('post', 'https://34.200.105.231/VENTAS_SOAP/VentaService.svc?wsdl')
            xhr.setRequestHeader('Content-Type', 'application/soap+xml;charset=UTF-8')
            xhr.responseType = 'document'
            xhr.onload = () => {
                if (xhr.status !== 200) {
                    obs.error(xhr.responseXML.getElementsByTagName('Message').item(1).textContent)
                    obs.complete();
                    return
                }
                let art: {}
                try {
                    art = xhr.responseXML
                } catch (e) {
                    obs.error(e)
                    obs.complete();
                    return
                }

                obs.next(art);
                obs.complete();

            }
            xhr.onerror = e => {
                obs.error(e)
                obs.complete();
            }
            xhr.send(`<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="VentaServicio">
            <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">
                <wsa:To>https://34.200.105.231/VENTAS_SOAP/VentaService.svc</wsa:To>
                <wsa:Action>VentaServicio/VentaServicio/ConsultaArticulo</wsa:Action>
                </soap:Header>
            <soap:Body>
                <tem:sesion>
                    <!--Optional:-->
                    <ws:IDCliente>${sesion.IDCliente}</ws:IDCliente>
                    <!--Optional:-->
                    <ws:IDEmpresa>${sesion.IDEmpresa}</ws:IDEmpresa>
                    <!--Optional:-->
                    <ws:IDSesion>${sesion.IDSesion}</ws:IDSesion>
                    <!--Optional:-->
                    <ws:IDUsuario>${sesion.IDUsuario}</ws:IDUsuario>
                </tem:sesion>
                <tem:codigo>${codigo}</tem:codigo>
            </soap:Body>
            </soap:Envelope>`)
        }))
}
