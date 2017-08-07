
(function () {

    var TabId: string
    var NumOrden: string
    var listItms: number

    function getTabInfo() {
        chrome.runtime.sendMessage({ op: 'QuienSoy' }, null, function (response) {
            TabId = response.tabId + '';
            switch (window.location.href) {
                case 'https://www1.sii.cl/cgi-bin/Portal001/mipeGenFacEx.cgi?PTDC_CODIGO=33':
                case 'https://www1.sii.cl/cgi-bin/Portal001/mipeGenFacEx.cgi?PTDC_CODIGO=34':
                case 'https://www1.sii.cl/cgi-bin/Portal001/mipeGenFacEx.cgi?PTDC_CODIGO=52':
                    listItms = 1
                case 'https://www1.sii.cl/cgi-bin/Portal001/mipeGenFacEx.cgi?TIPO_PLANTILLA=NC_BLANCO&PTDC_CODIGO=61':
                case 'https://www1.sii.cl/cgi-bin/Portal001/mipeGenFacEx.cgi?TIPO_PLANTILLA=NC_BLANCO&PTDC_CODIGO=56':
                    if (listItms === undefined) listItms = 3
                    chrome.storage.local.remove(TabId);
                    break;

            }
        });
    }

    function RellenarFormularioSII(dte: any) {

        clearDTE()

        if (dte.vencimiento) dte.vencimiento = new Date(dte.vencimiento);
        if (dte.emision) dte.emision = new Date(dte.emision);

        var event = new KeyboardEvent('change')

        if ($("[name='TIPO_PLANTILLA']").val() == 'GUIA_DESPACHO' && dte.soloTraslado)
            $("[name='EFXP_IND_VENTA']").val('6');

        if (dte.RUT) $("[name='EFXP_RUT_RECEP']").val(dte.RUT);
        if (dte.RUT_DV) $("[name='EFXP_DV_RECEP']").val(dte.RUT_DV);

        if (dte.contacto) $("[name='EFXP_CONTACTO']").val(dte.contacto);



        if (dte.items.some((item: any) => item.codigo)) //Verifica si algun item de la factura tiene codigo
            $("[name='COD_SI_NO']")[0].click();

        if (dte.items.some((item: any) => {
            if (!item.impuesto) return false;
            if (dte.retenedorIVACarne) return item.impuesto != '18'
            return true;
        })) //Verifica si algun item de la factura tiene impuesto
            if ($("[name='OTRO_IMP_SI_NO']")[0]) $("[name='OTRO_IMP_SI_NO']")[0].click();

        for (var i = 0; i < dte.items.length; ++i) {

            if (i == 10) {
                alert('No se pudieron agregar todos los items a la factura, el SII no permiten mas de 10');
                break;
            }
            if (i >= listItms) $("[name='AGREGA_DETALLE']").click();


            let id = ('0' + (i + 1)).slice(-2);


            if (dte.items[i].tipoCod) {
                $("[name='EFXP_TPO_COD_" + id + "']").val(dte.items[i].tipoCod);
                document.querySelector("[name='EFXP_TPO_COD_" + id + "']").dispatchEvent(event);
            }

            if (dte.items[i].codigo) {
                $("[name='EFXP_COD_" + id + "']").val(dte.items[i].codigo);
                document.querySelector("[name='EFXP_COD_" + id + "']").dispatchEvent(event);
            }

            if (dte.items[i].descripcion) {
                $("[name='DESCRIP_" + id + "']")[0].click();
                $("[name='EFXP_DSC_ITEM_" + id + "']").val(dte.items[i].descripcion);
                document.querySelector("[name='EFXP_DSC_ITEM_" + id + "']").dispatchEvent(event);
            }

            if (dte.items[i].impuesto)
                if (dte.items[i].impuesto != '18' || (!dte.retenedorIVACarne && dte.items[i].impuesto == '18')) {
                    $("[name='EFXP_OTRO_IMP_" + id + "']").val(dte.items[i].impuesto);
                    document.querySelector("[name='EFXP_OTRO_IMP_" + id + "']").dispatchEvent(event);
                }


            $("[name='EFXP_NMB_" + id + "']").val(dte.items[i].nombre);
            document.querySelector("[name='EFXP_NMB_" + id + "']").dispatchEvent(event);

            $("[name='EFXP_QTY_" + id + "']").val(dte.items[i].cantidad);
            document.querySelector("[name='EFXP_QTY_" + id + "']").dispatchEvent(event);

            $("[name='EFXP_UNMD_" + id + "']").val(dte.items[i].unidad);
            document.querySelector("[name='EFXP_UNMD_" + id + "']").dispatchEvent(event);

            $("[name='EFXP_PRC_" + id + "']").val(dte.items[i].precio);
            document.querySelector("[name='EFXP_PRC_" + id + "']").dispatchEvent(event);

            if (dte.items[i].PorDescto && $("[name='EFXP_PCTD_" + id + "']").length > 0) {
                $("[name='EFXP_PCTD_" + id + "']").val(dte.items[i].porDescto);
                document.querySelector("[name='EFXP_PCTD_" + id + "']").dispatchEvent(event);
            }

        }

        if (dte.descuento && $("[name='EFXP_PCT_DESC']").length > 0) {
            $("[name='EFXP_PCT_DESC']").val(dte.descuento);
            document.querySelector("[name='EFXP_PCT_DESC']").dispatchEvent(event);
        }

        if (dte.vencimiento && $("[name='PAGO_SI_NO']").length > 0 && $("[name='PAGO_SI_NO']").val() == 'SiChecked'
            && (<HTMLInputElement>$("[name='PAGO_SI_NO']")[0]).style.visibility !== 'hidden') {
            $("[name='PAGO_SI_NO']")[0].click();

            $("[name='cbo_anio_boleta_pago_01']").val(dte.vencimiento.getFullYear());
            document.querySelector("[name='cbo_anio_boleta_pago_01']").dispatchEvent(event);


            (<HTMLSelectElement>$("[name='cbo_mes_boleta_pago_01']").get(0)).selectedIndex = dte.vencimiento.getMonth();
            document.querySelector("[name='cbo_mes_boleta_pago_01']").dispatchEvent(event);

            $("[name='cbo_dia_boleta_pago_01']").val((dte.vencimiento.getDate() < 10 ? '0' : '') + dte.vencimiento.getDate());
            document.querySelector("[name='cbo_dia_boleta_pago_01']").dispatchEvent(event);

            $("[name='EFXP_MNT_PAGO_001']").val($("[name='EFXP_MNT_TOTAL']").val());
            document.querySelector("[name='EFXP_MNT_PAGO_001']").dispatchEvent(event);

            $("[name='EFXP_GLOSA_PAGOS_001']").val(dte.condicion);
            document.querySelector("[name='EFXP_GLOSA_PAGOS_001']").dispatchEvent(event);

        }


        if (dte.RUT) document.querySelector("[name='EFXP_DV_RECEP']").dispatchEvent(event);

    }


    function clearDTE() {

        if ($("[name='TIPO_PLANTILLA']").val() == 'GUIA_DESPACHO')
            $("[name='EFXP_IND_VENTA']").val('1');


        var event = new KeyboardEvent('change')

        $("[name='EFXP_RUT_RECEP']").val('');
        $("[name='EFXP_DV_RECEP']").val('');
        $("[name='EFXP_CONTACTO']").val('');

        var d = new Date();

        while ($("[name='QUITA_DETALLE']").length > 0) {
            $("[name='QUITA_DETALLE']").click();
        }

        if ($("[name='OTRO_IMP_SI_NO']")[0])
            if ((<HTMLInputElement>$("[name='OTRO_IMP_SI_NO']")[0]).checked)
                (<HTMLInputElement>$("[name='OTRO_IMP_SI_NO']")[0]).checked;

        for (let i = 0; i < listItms; ++i) {


            var id = ('0' + (i + 1)).slice(-2);

            if ((<HTMLInputElement>$("[name='COD_SI_NO']")[0]).checked) {
                $("[name='EFXP_TPO_COD_" + id + "']").val('');
                document.querySelector("[name='EFXP_TPO_COD_" + id + "']").dispatchEvent(event);
                $("[name='EFXP_COD_" + id + "']").val('');
                document.querySelector("[name='EFXP_COD_" + id + "']").dispatchEvent(event);
            }
            $("[name='EFXP_NMB_" + id + "']").val('');
            document.querySelector("[name='EFXP_NMB_" + id + "']").dispatchEvent(event);

            $("[name='EFXP_QTY_" + id + "']").val('');
            document.querySelector("[name='EFXP_QTY_" + id + "']").dispatchEvent(event);

            $("[name='EFXP_UNMD_" + id + "']").val('');
            document.querySelector("[name='EFXP_UNMD_" + id + "']").dispatchEvent(event);

            $("[name='EFXP_PRC_" + id + "']").val('');
            document.querySelector("[name='EFXP_PRC_" + id + "']").dispatchEvent(event);

            if ($("[name='EFXP_PCTD_" + id + "']").length > 0) {
                $("[name='EFXP_PCTD_" + id + "']").val('');
                document.querySelector("[name='EFXP_PCTD_" + id + "']").dispatchEvent(event);
            }

            if ((<HTMLInputElement>$("[name='DESCRIP_" + id + "']")[0]).checked) {
                $("[name='EFXP_DSC_ITEM_" + id + "']").val('');
                $("[name='DESCRIP_" + id + "']")[0].click();
            }

        }

        if ((<HTMLInputElement>$("[name='COD_SI_NO']")[0]).checked) $("[name='COD_SI_NO']")[0].click();


        if ($("[name='PAGO_SI_NO']")[0] && (<HTMLInputElement>$("[name='PAGO_SI_NO']")[0]).checked
            && (<HTMLInputElement>$("[name='PAGO_SI_NO']")[0]).style.visibility !== 'hidden') {

            $("[name='EFXP_FCH_EMIS']").val(new Date().toJSON().substr(0, 10));
            document.querySelector("[name='EFXP_FCH_EMIS']").dispatchEvent(event);


            $("[name='EFXP_MNT_PAGO_001']").val('');
            document.querySelector("[name='EFXP_MNT_PAGO_001']").dispatchEvent(event);

            $("[name='EFXP_GLOSA_PAGOS_001']").val('');
            document.querySelector("[name='EFXP_GLOSA_PAGOS_001']").dispatchEvent(event);

            $("[name='PAGO_SI_NO']")[0].click();
        }

        if ($("[name='EFXP_MNT_DESC']").length > 0) {
            $("[name='EFXP_MNT_DESC']").val('');
            $("[name='EFXP_MNT_DESC']").change();
        }

    }

    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        switch (message.op) {
            case 'RellenarSIIForm':
                RellenarFormularioSII(message.dte)
                break;
        }
    });


    getTabInfo();

    (function replaceFuncionesImpuestos() {
        var s = document.createElement('script');
        s.text = `
            function getGlosaOtrosImp(tpoImp) {
                var temp = ' WHAT??????' + tpoImp;

                if (tpoImp == 23) temp = 'Art. de oro, Joyas y Pieles finas 15%';
                else if (tpoImp == 44) temp = 'Tapices, Casas rod., Caviar y Arm.de aire 15%';
                else if (tpoImp == 18) temp = 'Anticipo IVA de carne 5%';
                else if (tpoImp == 24) temp = 'Licores, Pisco, Destilados 31,5%';
                else if (tpoImp == 25) temp = 'Vinos, Chichas, Sidras 20,5%';
                else if (tpoImp == 26) temp = decodeURI('Cervezas y Otras bebidas alcoh%C3%B3licas 20,5%25');
                else if (tpoImp == 27) temp = decodeURI('Aguas minerales y Beb. analcoh%C3%B3l. 10%25');
                else if (tpoImp == 271) temp = decodeURI('Beb. analcoh%C3%B3l. elevado cont azucar 18%25');

                return temp;
            }
            function genSelectOtrosImp(tpoImp) {
                var temp;
                var tpoDoc = document.forms["VIEW_EFXP"].elements["PTDC_CODIGO"].value;
                var tpoSelect;

                if ((tpoDoc == 33) || (tpoDoc == 52)) tpoSelect = 1;
                else if ((tpoDoc == 56) || (tpoDoc == 61)) tpoSelect = 2;
                else if (tpoDoc == 46) tpoSelect = 3;

                if ((tpoImp == null) || (tpoImp.length == 0))
                    temp = '<OPTION VALUE="" selected>NO TIENE</OPTION>';
                else
                    temp = '<OPTION VALUE="">NO TIENE</OPTION>';
                if (((tpoSelect == 1) || (tpoSelect == 2)) && (tpoImp == 23))
                    temp += '<OPTION VALUE=23 selected>' + getGlosaOtrosImp(23) + '</OPTION>';
                else if ((tpoSelect == 1) || (tpoSelect == 2))
                    temp += '<OPTION VALUE=23>' + getGlosaOtrosImp(23) + '</OPTION>';

                if (((tpoSelect == 1) || (tpoSelect == 2)) && (tpoImp == 44))
                    temp += '<OPTION VALUE=44 selected>' + getGlosaOtrosImp(44) + '</OPTION>';
                else if ((tpoSelect == 1) || (tpoSelect == 2))
                    temp += '<OPTION VALUE=44>' + getGlosaOtrosImp(44) + '</OPTION>';

                if (((tpoSelect == 1) || (tpoSelect == 2)) && (tpoImp == 18))
                    temp += '<OPTION VALUE=18 selected>' + getGlosaOtrosImp(18) + '</OPTION>';
                else if ((tpoSelect == 1) || (tpoSelect == 2))
                    temp += '<OPTION VALUE=18>' + getGlosaOtrosImp(18) + '</OPTION>';


                if (((tpoSelect == 1) || (tpoSelect == 2)) && (tpoImp == 24))
                    temp += '<OPTION VALUE=24 selected>' + getGlosaOtrosImp(24) + '</OPTION>';
                else if ((tpoSelect == 1) || (tpoSelect == 2))
                    temp += '<OPTION VALUE=24>' + getGlosaOtrosImp(24) + '</OPTION>';

                if (((tpoSelect == 1) || (tpoSelect == 2)) && (tpoImp == 25))
                    temp += '<OPTION VALUE=25 selected>' + getGlosaOtrosImp(25) + '</OPTION>';
                else if ((tpoSelect == 1) || (tpoSelect == 2))
                    temp += '<OPTION VALUE=25>' + getGlosaOtrosImp(25) + '</OPTION>';

                if (((tpoSelect == 1) || (tpoSelect == 2)) && (tpoImp == 26))
                    temp += '<OPTION VALUE=26 selected>' + getGlosaOtrosImp(26) + '</OPTION>';
                else if ((tpoSelect == 1) || (tpoSelect == 2))
                    temp += '<OPTION VALUE=26>' + getGlosaOtrosImp(26) + '</OPTION>';

                if (((tpoSelect == 1) || (tpoSelect == 2)) && (tpoImp == 27))
                    temp += '<OPTION VALUE=27 selected>' + getGlosaOtrosImp(27) + '</OPTION>';
                else if ((tpoSelect == 1) || (tpoSelect == 2))
                    temp += '<OPTION VALUE=27>' + getGlosaOtrosImp(27) + '</OPTION>';

                if (((tpoSelect == 1) || (tpoSelect == 2)) && (tpoImp == 271))
                    temp += '<OPTION VALUE=271 selected>' + getGlosaOtrosImp(271) + '</OPTION>';
                else if ((tpoSelect == 1) || (tpoSelect == 2))
                    temp += '<OPTION VALUE=271>' + getGlosaOtrosImp(271) + '</OPTION>';

                return temp;
            }

            dibujaDetalles();
        `
        document.body.appendChild(s);

    })();

})();
