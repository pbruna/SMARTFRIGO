
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url.indexOf('https://www1.sii.cl/cgi-bin/Portal001/mipeGenFacEx.cgi?') == 0) chrome.pageAction.show(tabId);
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.op) {
        case 'RellenarSIIForm': //Enviado desde el popup
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs.length == 0) return;
                message.tabId = tabs[0].id;
                chrome.tabs.sendMessage(message.tabId, message);
            });
            break;
        case 'QuienSoy': //Enviado desde contentscript
            sendResponse({ tabId: sender.tab.id });
            break;
        case 'PruebaSubida':
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs.length == 0) return;
                message.tabId = tabs[0].id;
                chrome.tabs.sendMessage(message.tabId, message);
            });
            break;
        case 'SubirPDF':
            SubirPDFaALMAFRIGO(message, sendResponse);
            return true;
    }
});

chrome.webRequest.onBeforeRequest.addListener(function (details) {

    return {
        redirectUrl: 'https://docs.google.com/uc?authuser=0&id=0B7KGwTMzOZYKRnBDQkdHdGx6WUk&export=download'
    };
}, { urls: ['https://www1.sii.cl/Portal001/JS/validaUtil.js'] }, ['blocking']);



function SubirPDFaALMAFRIGO(message, func: Function) {
    message.tabId = parseInt(message.tabId);
    var xhrp = new XMLHttpRequest()
    xhrp.open('post', 'http://www.almafrigo.cl/webservices/webserviceoperaciones.asmx/OrdenesDeSalida_subirPDF')
    xhrp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhrp.onload = function () { //Se ha enviado a ALMAFRIGO el documento
        func({ status: 'OK' });
    }
    xhrp.onerror = function () { //No se ha enviado a ALMAFRIGO el documento
        func({ status: 'ERROR' });
    }
    xhrp.upload.onprogress = function (e) {
        console.log(e);
        if (e.lengthComputable)
            chrome.tabs.sendMessage(message.tabId, { op: 'PorcentajeSubidaPDF', valor: e.loaded / e.total });
    }
    xhrp.ontimeout = function () {
        func({ status: 'TIMEOUT' });
    }
    xhrp.send("numorden=" + message.numorden + "&pdf=" + message.pdf64Base);

}




