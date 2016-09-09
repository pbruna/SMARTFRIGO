var pdf64Base;
var timbreElec;
var status;
(function makeTest() {
    var xhr = new XMLHttpRequest();
    xhr.open('get', 'http://www.almafrigo.cl/webservices/WebServiceOperaciones.asmx/OrdenesDeSalida_GetDocumentoDeRegistro?idReg=65dc5ae9-64c4-4f4b-9847-40f4a04dfabc');
    xhr.responseType = 'blob';
    xhr.onload = function () {
        console.log('Descarga finalizada correctamente. Enviando a scan');
        var sc = new ScanPDF417();
        sc.ScanPDF417FromPDFFile(xhr.response, 1, 4, function (result) {
            if (result.status === ScanPDF417ResultStatus.OK)
                timbreElec = result.result[0].Text;
            if (pdf64Base)
                EnviarPDFalBack();
        });
        var reader = new FileReader();
        reader.readAsDataURL(xhr.response);
        reader.onloadend = function () {
            pdf64Base = reader.result.substr(reader.result.indexOf('base64,') + 7);
            if (status)
                EnviarPDFalBack();
        };
    };
    xhr.send();
    console.log('Solicitada Descarga');
    function EnviarPDFalBack() {
        chrome.runtime.sendMessage({ op: 'SubirPDF', pdf64Base: pdf64Base, tabId: 1, numorden: 46, timbreElec: timbreElec }, null, function (response) {
        });
    }
})();
//# sourceMappingURL=context-pruebas.js.map