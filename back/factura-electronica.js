var timbreElectronico = (function () {
    function timbreElectronico() {
        this.rutReceptor = '';
        this.razonReceptor = '';
        this.isErr = false;
    }
    timbreElectronico.prototype.leerTimbre = function (text) {
        var dp = new DOMParser();
        try {
            var doc = dp.parseFromString(text, "application/xml");
            this.rutEmisor = doc.getElementsByTagName('RE')[0].innerHTML;
            this.razonEmisor = doc.getElementsByTagName('RS')[0].innerHTML;
            this.rutReceptor = doc.getElementsByTagName('RR')[0].innerHTML;
            this.razonReceptor = doc.getElementsByTagName('RSR')[0].innerHTML;
            this.folio = parseInt(doc.getElementsByTagName('F')[0].innerHTML);
            this.fechaEmision = new Date(doc.getElementsByTagName('TSTED')[0].innerHTML);
            this.fechaDocumento = doc.getElementsByTagName('FE')[0].innerHTML;
            this.tipoDTE = parseInt(doc.getElementsByTagName('TD')[0].innerHTML);
        }
        catch (err) {
            this.isErr = true;
        }
    };
    timbreElectronico.prototype.getNombreArchivo = function (NomCorto) {
        if (this.isErr)
            return 'DocumentoTributario';
        return documentosElectronicos[this.tipoDTE] + '.' + this.fechaDocumento + '.' + ('000000' + this.folio).slice(-6) +
            '.' + (NomCorto ? NomCorto : this.razonReceptor);
    };
    return timbreElectronico;
}());
export { timbreElectronico };
export var documentosElectronicos;
(function (documentosElectronicos) {
    documentosElectronicos[documentosElectronicos["FactElec"] = 33] = "FactElec";
    documentosElectronicos[documentosElectronicos["FactExenta"] = 34] = "FactExenta";
    documentosElectronicos[documentosElectronicos["FactCompra"] = 46] = "FactCompra";
    documentosElectronicos[documentosElectronicos["GuiadeDespElect"] = 52] = "GuiadeDespElect";
    documentosElectronicos[documentosElectronicos["NotadeDebElect"] = 56] = "NotadeDebElect";
    documentosElectronicos[documentosElectronicos["NotadeCredElect"] = 61] = "NotadeCredElect";
    documentosElectronicos[documentosElectronicos["LiquiFactElect"] = 43] = "LiquiFactElect";
})(documentosElectronicos || (documentosElectronicos = {}));
//# sourceMappingURL=factura-electronica.js.map