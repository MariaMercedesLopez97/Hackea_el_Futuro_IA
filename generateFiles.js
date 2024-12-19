import XlsxPopulate from "xlsx-populate";


async function createNewFileXLSX(formData) {
    const workbook = await XlsxPopulate.fromBlankAsync();
    const sheet = workbook.sheet(0);

    // Encabezados - Cliente
    sheet.cell('A1').value('Datos del Cliente');
    sheet.cell('A2').value('Nombre');
    sheet.cell('B2').value(formData.clienteName);
    sheet.cell('A3').value('RUC');
    sheet.cell('B3').value(formData.clienteRuc);
    sheet.cell('A4').value('Email');
    sheet.cell('B4').value(formData.clienteEmail);

    // Encabezados - Productos
    sheet.cell('A6').value('Datos del Producto');
    sheet.cell('A7').value('Número de Item');
    sheet.cell('B7').value(formData.NumeroItem);
    sheet.cell('A8').value('Descripción');
    sheet.cell('B8').value(formData.Descripcion);
    sheet.cell('A9').value('Cantidad');
    sheet.cell('B9').value(formData.Cantidad);
    sheet.cell('A10').value('Precio Unitario');
    sheet.cell('B10').value(formData.PrecioUnitario);
    sheet.cell('A11').value('Precio Total');
    sheet.cell('B11').value(formData.PrecioTotal);
    sheet.cell('A12').value('Peso Neto');
    sheet.cell('B12').value(formData.PesoNeto);
    sheet.cell('A13').value('Peso Bruto');
    sheet.cell('B13').value(formData.PesoBruto);
    sheet.cell('A14').value('NCM');
    sheet.cell('B14').value(formData.NCM);

    // Opcional: Dar formato
    sheet.range('A1:B1').style('fill', 'CCCCCC');
    sheet.range('A6:B6').style('fill', 'CCCCCC');
    sheet.column('A').width(15);
    sheet.column('B').width(20);

    await workbook.toFileAsync('./nota_compra.xlsx');
}

const generateXML = (formData) => {
    const xmlContent = xmlbuilder.create('OrdenCompra')
        .ele('Cliente')
            .ele('Nombre', formData.clienteName).up()
            .ele('RUC', formData.clienteRuc).up()
            .ele('Email', formData.clienteEmail).up()
        .up()
        .ele('Productos')
        .ele('Producto')
            .ele('NumeroItem', formData.NumeroItem).up()
            .ele('Descripcion', formData.Descripcion).up()
            .ele('Cantidad', formData.Cantidad).up()
            .ele('PrecioUnitario', formData.PrecioUnitario).up()
            .ele('PrecioTotal', formData.PrecioTotal).up()
            .ele('PesoNeto', formData.PesoNeto).up()
            .ele('PesoBruto', formData.PesoBruto).up()
            .ele('NCM', formData.NCM).up()
        .end({ pretty: true });

    return xmlContent;;
};
module.exports = {createNewFileXLSX, generateXML}