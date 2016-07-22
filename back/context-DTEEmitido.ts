
(function () {

    var div = document.createElement('div');
    var msg = document.createElement('div');
    var prg = document.createElement('progress')
    var pdf64Base: string
    var TabId: string
    var NumOrden: string


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
        var a = <HTMLAnchorElement>document.querySelector('a[href^="/cgi-bin/Portal001/mipeDisplayPDF.cgi?DHDR_CODIGO="]')
        var xhr = new XMLHttpRequest()
        $(div).dialog('open');
        msg.innerText = 'Estamos bajando la factura del SII.';

        xhr.open('get', a.href)
        xhr.onload = function () { //Se ha descargado el documento
            var reader = new FileReader();
            reader.readAsDataURL(xhr.response);
            reader.onloadend = function () {
                pdf64Base = reader.result.substr(reader.result.indexOf('base64,') + 7);
                EnviarPDFalBack();
            }

        }
        xhr.onerror = function () {
            msg.innerText = 'No se ha podido descargar el documento desde el SII. Vuelva a intentarlo';
            msg.style.color = 'red';
            prg.style.display = 'none'
            $(div).dialog('option', 'buttons', [{
                text: "Reintentar",
                click: EnviarPDFalBack
            }]);
        }
        xhr.responseType = "blob";
        xhr.send()
    }

    function EnviarPDFalBack() {
        $(div).dialog('option', 'buttons', []);
        if (!pdf64Base) return BajarPDF();
        msg.innerText = decodeURI("Estamos subiendo la factura a ALMAFRIGO para que viaje junto con la mercader%C3%ADa, por favor no cierre la p%C3%A1gina.");
        msg.style.color = '';
        prg.style.display = ''
        prg.value = 0;
        chrome.runtime.sendMessage({ op: 'SubirPDF', pdf64Base: pdf64Base, tabId: TabId, numorden: NumOrden }, null, function (response) {
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
            width: 600
        });

    }

    onLoad();

})();


