
import './BigInteger.min'
var ZXing = require('./zxing-pdf417.min');
var PDFJS = require('./PDF.min');

export class ScanPDF417 {


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

        var fr = new FileReader();
        fr.onload = function () {
            PDFJS.getDocument(fr.result).then(function (pdf) {
                pdf.getPage(numPage).then(function (page) {
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    var viewport = page.getViewport(zoom);
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                console.log('imagen a análisis');

                    page.render({ canvasContext: context, viewport: viewport }).promise.then(function () {
                        var img = document.createElement('img');
                        img.src = canvas.toDataURL('image/jpeg');
                        if (callBack) callBack(this.ScanPDF417FromImgHTMLElement(img));
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

export class ScanPDF417Result {
    constructor(status: ScanPDF417ResultStatus, text?: string, err?: any) { }
}

export enum ScanPDF417ResultStatus { OK, Error };