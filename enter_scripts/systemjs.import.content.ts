declare var SystemJS: any


let urls: { [key: string]: string[] } = {
    "https://www1.sii.cl/cgi-bin/Portal001/mipeSendXML.cgi*": [
        "scripts_npm/jquery.min.js",
        "scripts_npm/jquery-ui.min.js",
        "scripts_npm/BigInteger.min.js",
        "back/zxing-pdf417.js",
        "scripts_npm/pdf.combined.js",
        "contents_scripts/context-dte-emitido.js"
    ],
    "https://www1.sii.cl/cgi-bin/Portal001/mipeGenFacEx.cgi*": [
        "scripts_npm/jquery.min.js",
        "contents_scripts/context-form-dte.js"
    ],
    "http://www.almafrigo.cl/mi_cuenta.aspx*": [
        "node_modules/systemjs/dist/system.src.js",
        "config.js",
        "contents_scripts/enter-context-os.js"
    ]
}

urls["http://localhost:51346/mi_cuenta.aspx"] = urls["http://www.almafrigo.cl/mi_cuenta.aspx*"]

let url = Object.keys(urls).find(k => {
    let pts = k.split('*')
    let lpos = 0;
    return pts.every((p, i) =>
        (lpos = document.location.href.indexOf(p, lpos + (i == 0 ? 0 : pts[i - 1].length))) > -1)
})
if (url && urls[url] && urls[url].length > 0)
    urls[url].forEach(u => SystemJS.import(chrome.extension.getURL(u)))
