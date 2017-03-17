var urls = {
    "https://www1.sii.cl/cgi_csm/csmDespF29.cgi": 'content-f29-propuesta',
    "https://www.sii.cl/cgi_SIDCON/CONCVF_VerFormulario.cgi*COD_FORM=F29*": 'content-f29-compacto',
    "https://www.sii.cl/cgi_SIDCON/CONMNF_Menu.cgi*": 'content-f29',
    "https://www1.sii.cl/cgi-bin/Portal001/mipeAdminDocsEmi.cg*": 'content-dte-recibidos',
    "https://palena.sii.cl/cgi_dte/consultaDTE/wsDTEConsRecCont.sh": 'content-dte-recibidos-sii',
    "https://www1.sii.cl/cgi-bin/Portal001/mipeVisualizaLibro.cgi*": 'content-lcv',
    "https://www1.sii.cl/cgi-bin/Portal001/mipeDetalleLbr.cgi*": 'content-ingreso-doc-lcv',
    "https://www1.sii.cl/cgi-bin/Portal001/mipeDespAgrDetalle.cgi*": 'content-ingreso-detalle-lcv'
};
var url = Object.keys(urls).find(function (k) {
    var pts = k.split('*');
    var lpos = 0;
    return pts.every(function (p, i) {
        return (lpos = document.location.href.indexOf(p, lpos + (i == 0 ? 0 : pts[i - 1].length))) > -1;
    });
});
if (url && urls[url] !== '')
    SystemJS.import(chrome.extension.getURL('/contents_scripts/' + urls[url]));
//# sourceMappingURL=systemjs.import.content.js.map