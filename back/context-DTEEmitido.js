(function () {
    var div = document.createElement('div');
    var msg = document.createElement('div');
    var prg = document.createElement('progress');
    var pdf64Base;
    var TabId;
    var NumOrden;
    var timbreElec;
    var status;
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        switch (message.op) {
            case 'PorcentajeSubidaPDF':
                prg.value = message.valor;
                break;
        }
    });
    chrome.runtime.sendMessage({ op: 'QuienSoy' }, null, function (response) {
        TabId = response.tabId + '';
        chrome.storage.local.get(TabId, function (item) {
            if (!item[TabId])
                return;
            NumOrden = item[TabId].NumOrden;
            BajarPDF();
            chrome.storage.local.remove(TabId);
        });
    });
    function BajarPDF() {
        var a = document.querySelector('a[href^="/cgi-bin/Portal001/mipeDisplayPDF.cgi?DHDR_CODIGO="]');
        var xhr = new XMLHttpRequest();
        $(div).dialog('open');
        msg.innerText = 'Estamos bajando la factura del SII.';
        xhr.open('get', a.href);
        xhr.onload = function () {
            msg.innerText = 'Analizando el documento.';
            var sc = new ScanPDF417();
            sc.ScanPDF417FromPDFFile(xhr.response, 1, 4, function (result) {
                status = result.status;
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
        xhr.onerror = function () {
            msg.innerText = 'No se ha podido descargar el documento desde el SII. Vuelva a intentarlo';
            msg.style.color = 'red';
            prg.style.display = 'none';
            $(div).dialog('option', 'buttons', [{
                    text: "Reintentar",
                    click: BajarPDF
                }]);
        };
        xhr.responseType = "blob";
        xhr.send();
    }
    function EnviarPDFalBack() {
        $(div).dialog('option', 'buttons', []);
        msg.innerText = decodeURI("Estamos subiendo la factura a ALMAFRIGO para que viaje junto con la mercader%C3%ADa, por favor no cierre la p%C3%A1gina.");
        msg.style.color = '';
        prg.style.display = '';
        prg.value = 0;
        chrome.runtime.sendMessage({ op: 'SubirPDF', pdf64Base: pdf64Base, tabId: TabId, numorden: NumOrden, timbreElec: timbreElec }, null, function (response) {
            switch (response.status) {
                case 'OK':
                    msg.innerHTML = decodeURI('La factura ya est%C3%A1 en ALMAFRIGO, se imprimir%C3%A1 cuando se realice el despacho. %3Cbr /%3EYa puede cerrar la p%C3%A1gina.');
                    break;
                case 'ERROR':
                    msg.innerText = 'Ha ocurrido un error en el servidor. Vuelva a intentarlo';
                    $(div).dialog('option', 'buttons', [{
                            text: "Reintentar",
                            click: EnviarPDFalBack
                        }]);
                    msg.style.color = 'red';
                    prg.style.display = 'none';
                    break;
                case 'TIMEOUT':
                    $(div).dialog('option', 'buttons', [{
                            text: "Reintentar",
                            click: EnviarPDFalBack
                        }]);
                    msg.innerText = decodeURI('Se ha superado el tiempo para la operaci%C3%B3n. Vuelva a intentarlo');
                    msg.style.color = 'red';
                    prg.style.display = 'none';
                    break;
            }
        });
    }
    function onLoad() {
        div.style.textAlign = 'center';
        div.style.fontSize = '16px';
        div.appendChild(msg);
        div.appendChild(document.createElement('br'));
        div.appendChild(prg);
        $(div).dialog({
            autoOpen: false,
            closeOnEscape: false,
            title: decodeURI('ALMAFRIGO - Servicios Log%C3%ADsticos y Almacenamiento Frigor%C3%ADfico'),
            width: 600
        });
    }
    onLoad();
})();
var ScanPDF417 = (function () {
    function ScanPDF417() {
        this.ScanPDF417FromImgHTMLElement = function (image) {
            var canvas = document.createElement('canvas'), canvas_context = canvas.getContext('2d'), source, binarizer, bitmap;
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            canvas_context.drawImage(image, 0, 0, canvas.width, canvas.height);
            try {
                source = new ZXing.BitmapLuminanceSource(canvas_context, image);
                binarizer = new ZXing.Common.HybridBinarizer(source);
                bitmap = new ZXing.BinaryBitmap(binarizer);
                return new ScanPDF417Result(ScanPDF417ResultStatus.OK, ZXing.PDF417.PDF417Reader.decode(bitmap, null, false));
            }
            catch (err) {
                return new ScanPDF417Result(ScanPDF417ResultStatus.Error, null, err);
            }
        };
        this.ScanPDF417FromPDFFile = function (file, numPage, zoom, callBack) {
            var sc = this;
            var fr = new FileReader();
            fr.onload = function () {
                PDFJS.getDocument(fr.result).then(function (pdf) {
                    pdf.getPage(numPage).then(function (page) {
                        var canvas = document.createElement('canvas');
                        var context = canvas.getContext('2d');
                        var viewport = page.getViewport(zoom);
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        page.render({ canvasContext: context, viewport: viewport }).promise.then(function () {
                            var img = document.createElement('img');
                            img.src = canvas.toDataURL('image/jpeg');
                            if (callBack)
                                callBack(sc.ScanPDF417FromImgHTMLElement(img));
                        }, function (err) {
                            console.log(err);
                        });
                    });
                });
            };
            fr.readAsArrayBuffer(file);
        };
        this.ScanPDF417FromBase64 = function (base64, numPage, zoom, callBack) {
            this.ScanPDF417FromPDFFile(this.b64toBlob(base64), numPage, zoom, callBack);
        };
        this.b64toBlob = function (b64Data) {
            var contentType = 'application/pdf';
            var sliceSize = 512;
            var byteCharacters = atob(b64Data);
            var byteArrays = [];
            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);
                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
                var byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }
            return new Blob(byteArrays, { type: contentType });
        };
    }
    return ScanPDF417;
}());
var ScanPDF417Result = (function () {
    function ScanPDF417Result(status, result, err) {
        this.status = status;
        this.result = result;
        this.err = err;
    }
    return ScanPDF417Result;
}());
var ScanPDF417ResultStatus;
(function (ScanPDF417ResultStatus) {
    ScanPDF417ResultStatus[ScanPDF417ResultStatus["OK"] = 0] = "OK";
    ScanPDF417ResultStatus[ScanPDF417ResultStatus["Error"] = 1] = "Error";
})(ScanPDF417ResultStatus || (ScanPDF417ResultStatus = {}));
;
//# sourceMappingURL=context-DTEEmitido.js.map