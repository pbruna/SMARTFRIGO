var urls = {
    "https://www1.sii.cl/cgi-bin/Portal001/mipeSendXML.cgi*": "contents_scripts/content-dte-emitido.js",
    "https://www1.sii.cl/cgi-bin/Portal001/mipeGenFacEx.cgi*": "contents_scripts/content-form-dte.js",
    "http://www.almafrigo.cl/mi_cuenta.aspx*": "contents_scripts/content-ordenes-salida.js"
};
urls["http://localhost:51346/mi_cuenta.aspx"] = urls["http://www.almafrigo.cl/mi_cuenta.aspx*"];
if (typeof document !== 'undefined') {
    var url = Object.keys(urls).find(function (k) {
        var pts = k.split('*');
        var lpos = 0;
        return pts.every(function (p, i) {
            return (lpos = document.location.href.indexOf(p, lpos + (i == 0 ? 0 : pts[i - 1].length))) > -1;
        });
    });
    if (url && urls[url])
        SystemJS.import(chrome.extension.getURL(urls[url]));
}
if (typeof module === 'undefined')
    var exports = {}; //si se está ejecutando en el navegador evitamos que export genere un error
//si se está ejecutando en el navegador evitamos que export genere un error
export function getBundle(url) {
    return urls[url];
}
//# sourceMappingURL=systemjs.import.content.js.map