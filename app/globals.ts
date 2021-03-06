import * as Globals from './objetos';
export const webServiceURL = 'http://www.almafrigo.cl/webservices/webserviceoperaciones.asmx';

export function createAFObject(Obj: any) {

    if (Obj == null) return null;
    if (Array.isArray(Obj)) {
        var r: any[] = [];
        Obj.forEach(function (it) { r.push(createAFObject(it)); });
        return r;
    }
    if (Obj.prototypeName == undefined) return Obj;

    var o;
    try {
        if (typeof Obj.prototypeName == 'function')
            o = new Obj.prototypeName();
        else
            o = new Globals[Obj.prototypeName.substr(Obj.prototypeName.lastIndexOf('.') + 1)]()
    } catch (e) {
        return Obj;
    }

    var props = Object.getOwnPropertyNames(Obj);
    for (var i = 0; i < props.length; ++i) {
        var s = props[i];
        var p = Object.getOwnPropertyDescriptor(Obj, s);
        if (typeof (Obj[s]) == 'object') {
            p.value = createAFObject(p.value)
            Object.defineProperty(o, s, p);
        } else if (s.indexOf("__thisIsDate") != -1) {
            o[s.substr(0, s.length - 12)] = new Date(p.value);
            o[s] = undefined;
        } else {
            Object.defineProperty(o, s, p);
        }
    }

    delete o.prototypeName;
    if (o.OnInit) o.OnInit();
    return o;
}

