// import { ScanPDF417, ScanPDF417ResultStatus} from './DoScan'
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
        case 'AnalizarPDF':
    }
});
chrome.webRequest.onBeforeRequest.addListener(function (details) {
    return {
        redirectUrl: 'https://docs.google.com/uc?authuser=0&id=0B7KGwTMzOZYKRnBDQkdHdGx6WUk&export=download'
    };
}, { urls: ['https://www1.sii.cl/Portal001/JS/validaUtil.js'] }, ['blocking']);
function SubirPDFaALMAFRIGO(message, func) {
    message.tabId = parseInt(message.tabId);
    var xhrp = new XMLHttpRequest();
    xhrp.open('post', 'http://www.almafrigo.cl/webservices/webserviceoperaciones.asmx/OrdenesDeSalida_subirPDF');
    xhrp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhrp.onload = function () {
        func({ status: 'OK' });
    };
    xhrp.onerror = function () {
        func({ status: 'ERROR' });
    };
    xhrp.upload.onprogress = function (e) {
        console.log(e);
        if (e.lengthComputable)
            chrome.tabs.sendMessage(message.tabId, { op: 'PorcentajeSubidaPDF', valor: e.loaded / e.total });
    };
    xhrp.ontimeout = function () {
        func({ status: 'TIMEOUT' });
    };
    xhrp.send("numorden=" + message.numorden + "&pdf=" + message.pdf64Base);
}
//# sourceMappingURL=background.js.map