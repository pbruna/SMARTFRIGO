export class timbreElectronico {

    rutEmisor: string
    razonEmisor: string
    rutReceptor: string = ''
    razonReceptor: string = ''
    tipoDTE: documentosElectronicos
    folio: number
    fechaEmision: Date
    fechaDocumento: string
    isErr = false

    leerTimbre(text: string) {
        let dp = new DOMParser()
        try {
            let doc = dp.parseFromString(text, "application/xml")

            this.rutEmisor = doc.getElementsByTagName('RE')[0].innerHTML;
            this.razonEmisor = doc.getElementsByTagName('RS')[0].innerHTML;
            this.rutReceptor = doc.getElementsByTagName('RR')[0].innerHTML;
            this.razonReceptor = doc.getElementsByTagName('RSR')[0].innerHTML;
            this.folio = parseInt(doc.getElementsByTagName('F')[0].innerHTML);
            this.fechaEmision = new Date(doc.getElementsByTagName('TSTED')[0].innerHTML);
            this.fechaDocumento = doc.getElementsByTagName('FE')[0].innerHTML;
            this.tipoDTE = parseInt(doc.getElementsByTagName('TD')[0].innerHTML);

        } catch (err) {
            this.isErr = true;
        }


    }

    getNombreArchivo(NomCorto?: string): string {
        if(this.isErr) return 'DocumentoTributario';
        return documentosElectronicos[this.tipoDTE] + '.' + this.fechaDocumento + '.' + ('000000' + this.folio).slice(-6) +
            '.' + (NomCorto ? NomCorto : this.razonReceptor);
    }
}

export enum documentosElectronicos {
    FactElec = 33,
    FactExenta = 34,
    FactCompra = 46,
    GuiadeDespElect = 52,
    NotadeDebElect = 56,
    NotadeCredElect = 61,
    LiquiFactElect = 43

}