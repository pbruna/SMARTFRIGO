"use strict";
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
                        console.log('imagen a análisis');
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
exports.ScanPDF417 = ScanPDF417;
var ScanPDF417Result = (function () {
    function ScanPDF417Result(status, result, err) {
        this.status = status;
        this.result = result;
        this.err = err;
    }
    return ScanPDF417Result;
}());
exports.ScanPDF417Result = ScanPDF417Result;
(function (ScanPDF417ResultStatus) {
    ScanPDF417ResultStatus[ScanPDF417ResultStatus["OK"] = 0] = "OK";
    ScanPDF417ResultStatus[ScanPDF417ResultStatus["Error"] = 1] = "Error";
})(exports.ScanPDF417ResultStatus || (exports.ScanPDF417ResultStatus = {}));
var ScanPDF417ResultStatus = exports.ScanPDF417ResultStatus;
;
//# sourceMappingURL=DoScan.js.map