(function () {
    var TabId;
    var NumOrden;
    function getTabInfo() {
        chrome.runtime.sendMessage({ op: 'QuienSoy' }, null, function (response) {
            TabId = response.tabId + '';
            switch (window.location.href) {
                case 'https://www1.sii.cl/cgi-bin/Portal001/mipeGenFacEx.cgi?':
                    chrome.storage.local.get(TabId, function (item) {
                        if (item[TabId])
                            RellenarFormularioSIIPostBack(item[TabId]);
                    });
                    break;
                case 'https://www1.sii.cl/cgi-bin/Portal001/mipeGenFacEx.cgi?PTDC_CODIGO=33':
                case 'https://www1.sii.cl/cgi-bin/Portal001/mipeGenFacEx.cgi?PTDC_CODIGO=34':
                case 'https://www1.sii.cl/cgi-bin/Portal001/mipeGenFacEx.cgi?TIPO_PLANTILLA=NC_BLANCO&PTDC_CODIGO=61':
                case 'https://www1.sii.cl/cgi-bin/Portal001/mipeGenFacEx.cgi?TIPO_PLANTILLA=NC_BLANCO&PTDC_CODIGO=56':
                case 'https://www1.sii.cl/cgi-bin/Portal001/mipeGenFacEx.cgi?PTDC_CODIGO=52':
                    chrome.storage.local.remove(TabId);
                    break;
            }
        });
    }
    function RellenarFormularioSII(dte) {
        clearDTE();
        if (dte.vencimiento)
            dte.vencimiento = new Date(dte.vencimiento);
        if (dte.emision)
            dte.emision = new Date(dte.emision);
        var event = new KeyboardEvent('change');
        if ($("[name='TIPO_PLANTILLA']").val() == 'GUIA_DESPACHO' && dte.soloTraslado)
            $("[name='EFXP_IND_VENTA']").val('6');
        if (dte.RUT)
            $("[name='EFXP_RUT_RECEP']").val(dte.RUT);
        if (dte.RUT_DV)
            $("[name='EFXP_DV_RECEP']").val(dte.RUT_DV);
        if (dte.contacto)
            $("[name='EFXP_CONTACTO']").val(dte.contacto);
        if (dte.items.some(function (item) { return item.codigo; }))
            $("[name='COD_SI_NO']")[0].click();
        if (dte.items.some(function (item) {
            if (!item.impuesto)
                return false;
            if (dte.retenedorIVACarne)
                return item.impuesto != '18';
            return true;
        }))
            $("[name='OTRO_IMP_SI_NO']")[0].click();
        for (var i = 0; i < dte.items.length; ++i) {
            if (i == 10) {
                alert('No se pudieron agregar todos los items a la factura, el SII no permiten mas de 10');
                break;
            }
            if (i > 2)
                $("[name='AGREGA_DETALLE']").click();
            var id = ('0' + (i + 1)).slice(-2);
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
            var blur = new KeyboardEvent('blur');
            $("[name='EFXP_PCT_DESC']").val(dte.descuento);
            document.querySelector("[name='EFXP_PCT_DESC']").dispatchEvent(blur);
        }
        if (dte.vencimiento && $("[name='PAGO_SI_NO']").length > 0 && $("[name='PAGO_SI_NO']").val() == 'SiChecked') {
            $("[name='PAGO_SI_NO']")[0].click();
            $("[name='cbo_anio_boleta_pago_01']").val(dte.vencimiento.getFullYear());
            document.querySelector("[name='cbo_anio_boleta_pago_01']").dispatchEvent(event);
            $("[name='cbo_mes_boleta_pago_01']").get(0).selectedIndex = dte.vencimiento.getMonth();
            document.querySelector("[name='cbo_mes_boleta_pago_01']").dispatchEvent(event);
            $("[name='cbo_dia_boleta_pago_01']").val((dte.vencimiento.getDate() < 10 ? '0' : '') + dte.vencimiento.getDate());
            document.querySelector("[name='cbo_dia_boleta_pago_01']").dispatchEvent(event);
            $("[name='EFXP_MNT_PAGO_001']").val($("[name='EFXP_MNT_TOTAL']").val());
            document.querySelector("[name='EFXP_MNT_PAGO_001']").dispatchEvent(event);
            $("[name='EFXP_GLOSA_PAGOS_001']").val(dte.condicion);
            document.querySelector("[name='EFXP_GLOSA_PAGOS_001']").dispatchEvent(event);
        }
        if (dte.RUT)
            document.querySelector("[name='EFXP_DV_RECEP']").dispatchEvent(event);
    }
    function RellenarFormularioSIIPostBack(minidte) {
        var event = new KeyboardEvent('change');
        if (minidte.emision) {
            minidte.emision = new Date(minidte.emision);
            $("[name='cbo_anio_boleta']").val(minidte.emision.getFullYear());
            document.querySelector("[name='cbo_anio_boleta']").dispatchEvent(event);
            $("[name='cbo_mes_boleta']").val((minidte.emision.getMonth() < 9 ? '0' : '') + (minidte.emision.getMonth() + 1));
            document.querySelector("[name='cbo_mes_boleta']").dispatchEvent(event);
            $("[name='cbo_dia_boleta']").val((minidte.emision.getDate() < 10 ? '0' : '') + minidte.emision.getDate());
            document.querySelector("[name='cbo_dia_boleta']").dispatchEvent(event);
        }
    }
    function clearDTE() {
        if ($("[name='TIPO_PLANTILLA']").val() == 'GUIA_DESPACHO')
            $("[name='EFXP_IND_VENTA']").val('1');
        var event = new KeyboardEvent('change');
        $("[name='EFXP_RUT_RECEP']").val('');
        $("[name='EFXP_DV_RECEP']").val('');
        $("[name='EFXP_CONTACTO']").val('');
        var d = new Date();
        while ($("[name='QUITA_DETALLE']").length > 0) {
            $("[name='QUITA_DETALLE']").click();
        }
        if ($("[name='OTRO_IMP_SI_NO']")[0].checked)
            $("[name='OTRO_IMP_SI_NO']")[0].checked;
        for (var i = 0; i < 3; ++i) {
            var id = (i < 11 ? '0' : '') + (i + 1);
            if ($("[name='COD_SI_NO']")[0].checked) {
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
            if ($("[name='DESCRIP_" + id + "']")[0].checked) {
                $("[name='EFXP_DSC_ITEM_" + id + "']").val('');
                $("[name='DESCRIP_" + id + "']")[0].click();
            }
        }
        if ($("[name='COD_SI_NO']")[0].checked)
            $("[name='COD_SI_NO']")[0].click();
        if ($("[name='PAGO_SI_NO']")[0].checked) {
            $("[name='cbo_anio_boleta_pago_01']").val('');
            document.querySelector("[name='cbo_anio_boleta_pago_01']").dispatchEvent(event);
            $("[name='cbo_mes_boleta_pago_01']").get(0).selectedIndex = d.getMonth();
            document.querySelector("[name='cbo_mes_boleta_pago_01']").dispatchEvent(event);
            $("[name='cbo_dia_boleta_pago_01']").val((d.getDate() < 10 ? '0' : '') + d.getDate());
            document.querySelector("[name='cbo_dia_boleta_pago_01']").dispatchEvent(event);
            $("[name='EFXP_MNT_PAGO_001']").val('');
            document.querySelector("[name='EFXP_MNT_PAGO_001']").dispatchEvent(event);
            $("[name='EFXP_GLOSA_PAGOS_001']").val('');
            document.querySelector("[name='EFXP_GLOSA_PAGOS_001']").dispatchEvent(event);
            $("[name='PAGO_SI_NO']")[0].click();
        }
        if ($("[name='EFXP_MNT_DESC']").length > 0) {
            $("[name='EFXP_MNT_DESC']").val('');
            $("[name='EFXP_MNT_DESC']").blur();
        }
    }
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        switch (message.op) {
            case 'RellenarSIIForm':
                var o = {};
                o[message.tabId] = {
                    NumOrden: message.NumOrden,
                    emision: message.dte.emision
                };
                chrome.storage.local.set(o);
                RellenarFormularioSII(message.dte);
                break;
        }
    });
    getTabInfo();
})();
//# sourceMappingURL=context-FormDTE.js.map