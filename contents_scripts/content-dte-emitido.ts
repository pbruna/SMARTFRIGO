import { ZXing } from 'zxing-pdf417-extension'

import 'jquery-ui/ui/widget'

import 'jquery-ui/ui/widgets/mouse'
import 'jquery-ui/ui/widgets/button'
import 'jquery-ui/ui/widgets/checkboxradio'
import 'jquery-ui/ui/widgets/controlgroup'
import 'jquery-ui/ui/widgets/dialog'

import 'jquery-ui/ui/position'
import 'jquery-ui/ui/data'
import 'jquery-ui/ui/disable-selection'
import 'jquery-ui/ui/focusable'
import 'jquery-ui/ui/form-reset-mixin'
import 'jquery-ui/ui/keycode'
import 'jquery-ui/ui/labels'
import 'jquery-ui/ui/scroll-parent'
import 'jquery-ui/ui/tabbable'
import 'jquery-ui/ui/unique-id'
import 'jquery-ui/ui/safe-active-element'
import 'jquery-ui/ui/safe-blur'


(function () {

    var div = document.createElement('div');
    var msg = document.createElement('div');
    var prg = document.createElement('progress')
    var pdf64Base: string
    var TabId: string
    var NumOrden: string
    var timbreElec: string
    var status: ScanPDF417ResultStatus


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
            if (!item[TabId]) return;
            NumOrden = item[TabId].NumOrden;
            BajarPDF();
            chrome.storage.local.remove(TabId);

        });
    });


    function BajarPDF() {
        $(div).dialog('open');
        var a = <HTMLAnchorElement>document.querySelector('a[href^="/cgi-bin/Portal001/mipeDisplayPDF.cgi?DHDR_CODIGO="]')
        var xhr = new XMLHttpRequest()
        msg.innerText = 'Estamos bajando la factura del SII.';

        xhr.open('get', a.href)
        xhr.onload = function () { //Se ha descargado el documento

            msg.innerText = 'Analizando el documento.';

            let sc = new ScanPDF417()
            sc.ScanPDF417FromPDFFile(xhr.response, 1, 4, function (result: ScanPDF417Result) {
                status = result.status;
                if (result.status === ScanPDF417ResultStatus.OK) timbreElec = result.result[0].Text
                if (pdf64Base) EnviarPDFalBack();
            })

            var reader = new FileReader();
            reader.readAsDataURL(xhr.response);
            reader.onloadend = function () {
                pdf64Base = reader.result.substr(reader.result.indexOf('base64,') + 7);
                if (status) EnviarPDFalBack();
            }

        }
        xhr.onerror = function () {
            msg.innerText = 'No se ha podido descargar el documento desde el SII. Vuelva a intentarlo';
            msg.style.color = 'red';
            prg.style.display = 'none'
            $(div).dialog('option', 'buttons', [{
                text: "Reintentar",
                click: BajarPDF
            }]);
        }
        xhr.responseType = "blob";
        xhr.send()
    }

    function EnviarPDFalBack() {
        $(div).dialog('option', 'buttons', []);
        msg.innerText = decodeURI("Estamos subiendo la factura a ALMAFRIGO para que viaje junto con la mercader%C3%ADa, por favor no cierre la p%C3%A1gina.");
        msg.style.color = '';
        prg.style.display = ''
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
                    prg.style.display = 'none'
                    break;
                case 'TIMEOUT':
                    $(div).dialog('option', 'buttons', [{
                        text: "Reintentar",
                        click: EnviarPDFalBack
                    }]);
                    msg.innerText = decodeURI('Se ha superado el tiempo para la operaci%C3%B3n. Vuelva a intentarlo');
                    msg.style.color = 'red';
                    prg.style.display = 'none'
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
            width: 600,
            closeText: ''
        });



    }

    onLoad();

})();

declare var PDFJS: any;


class ScanPDF417 {
    ScanPDF417FromImgHTMLElement = function (image: HTMLImageElement): ScanPDF417Result {
        var
            canvas = document.createElement('canvas'),
            canvas_context = canvas.getContext('2d'),
            source,
            binarizer,
            bitmap;

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas_context.drawImage(image, 0, 0, canvas.width, canvas.height);

        try {
            source = new ZXing.BitmapLuminanceSource(canvas_context, image);
            binarizer = new ZXing.Common.HybridBinarizer(source);
            bitmap = new ZXing.BinaryBitmap(binarizer);
            return new ScanPDF417Result(ScanPDF417ResultStatus.OK, ZXing.PDF417.PDF417Reader.decode(bitmap, null, false))
        } catch (err) {
            return new ScanPDF417Result(ScanPDF417ResultStatus.Error, null, err)
        }
    }

    ScanPDF417FromPDFFile = function (file: File, numPage: number, zoom: number, callBack: Function) {
        let sc = this;
        let fr = new FileReader();
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
                        img.onload = function () {
                            if (callBack) callBack(sc.ScanPDF417FromImgHTMLElement(img));
                        }
                        img.src = canvas.toDataURL('image/jpeg');
                    }, function (err) {
                        console.log(err);
                    });

                });

            });


        }
        fr.readAsArrayBuffer(file);


    }

    ScanPDF417FromBase64 = function (base64: string, numPage: number, zoom: number, callBack: Function) {
        this.ScanPDF417FromPDFFile(this.b64toBlob(base64), numPage, zoom, callBack)

    }


    b64toBlob = function (b64Data: string): Blob {
        let contentType = 'application/pdf';
        let sliceSize = 512;

        let byteCharacters = atob(b64Data);
        let byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            let slice = byteCharacters.slice(offset, offset + sliceSize);

            let byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            let byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, { type: contentType });
    }
}

class ScanPDF417Result {
    status: ScanPDF417ResultStatus
    result: any
    err: any
    constructor(status: ScanPDF417ResultStatus, result?: any, err?: any) {
        this.status = status;
        this.result = result;
        this.err = err;
    }
}

enum ScanPDF417ResultStatus { OK, Error };


