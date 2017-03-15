"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factura_electronica_1 = require("./factura-electronica");
var raiz = 'http://www.almafrigo.cl/webservices/webserviceoperaciones.asmx/';
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url.indexOf('https://www1.sii.cl/cgi-bin/Portal001/mipeGenFacEx.cgi?') == 0)
        chrome.pageAction.show(tabId);
});
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.op) {
        case 'RellenarSIIForm':
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs.length == 0)
                    return;
                message.tabId = tabs[0].id;
                chrome.tabs.sendMessage(message.tabId, message);
            });
            break;
        case 'QuienSoy':
            sendResponse({ tabId: sender.tab.id });
            break;
        case 'SubirPDF':
            SubirPDFaALMAFRIGO(message, sendResponse);
            return true;
    }
});
chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
    switch (message.op) {
        case 'version':
            sendResponse(chrome.runtime.getManifest().version);
            break;
    }
});
function SubirPDFaALMAFRIGO(message, func) {
    message.tabId = parseInt(message.tabId);
    var te = new factura_electronica_1.timbreElectronico();
    te.leerTimbre(message.timbreElec);
    var xhrp = new XMLHttpRequest();
    xhrp.open('post', raiz + 'OrdenesDeSalida_subirPDFconTimbre');
    xhrp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhrp.onload = function () {
        func({ status: 'OK' });
    };
    xhrp.onerror = function () {
        func({ status: 'ERROR' });
    };
    xhrp.upload.onprogress = function (e) {
        if (e.lengthComputable)
            chrome.tabs.sendMessage(message.tabId, { op: 'PorcentajeSubidaPDF', valor: e.loaded / e.total });
    };
    xhrp.ontimeout = function () {
        func({ status: 'TIMEOUT' });
    };
    xhrp.send("numorden=" + message.numorden + "&pdf=" + message.pdf64Base + "&timbre=" + btoa(JSON.stringify(te)));
}
//# sourceMappingURL=background.js.map