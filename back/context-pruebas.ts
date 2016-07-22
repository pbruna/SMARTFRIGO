
(function makeTest() {
    var xhr = new XMLHttpRequest();
    xhr.open('get', 'http://www.almafrigo.cl/webservices/WebServiceOperaciones.asmx/OrdenesDeSalida_GetDocumentoDeRegistro?idReg=65dc5ae9-64c4-4f4b-9847-40f4a04dfabc')
    xhr.responseType = 'blob';
    xhr.onload = function () {
        console.log('Descraga finalizada correctamente. Comenzando transformación a base64');

        var reader = new FileReader();
        reader.readAsDataURL(xhr.response);
        reader.onloadend = function () {
        console.log('base64 finalizada. Enviando al Back');
            let pdf64Base = reader.result.substr(reader.result.indexOf('base64,') + 7);
            chrome.runtime.sendMessage({ op: 'AnalizarPDF', pdf64Base: pdf64Base }, null, function (response) {
                console.log(response);
            });
        }
    }
    xhr.send();
    console.log('Solicitada Descarga');

})()

