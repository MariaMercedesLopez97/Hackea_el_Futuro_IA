const express = require('express')
const app = express()
const PORT = 3000
const bodyParser = require('body-parser');
const fs = require('fs'); // Para guardar el XML en un archivo

const xmlbuilder = require('xmlbuilder');

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




// Middleware para parsear JSON
app.use(bodyParser.json());

// Ruta para generar XML
app.post('/generate-xml', (req, res) => {
    const { clienteName, clienteRuc, clienteEmail, ordenCompra } = req.body;

    // Validar datos básicos
    if (!clienteName || !clienteRuc || !clienteEmail || !ordenCompra) {
        return res.status(400).json({ error: 'Faltan datos en el formulario' });
    }

    // Generar contenido XML
    const xmlContent = generateXML(req.body)

    // Guardar en un archivo (opcional)
    fs.writeFileSync('orden_compra.xml', xmlContent);

    // Enviar XML como respuesta
    res.header('Content-Type', 'application/xml');
    res.send(xmlContent);
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

document.addEventListener('DOMContentLoaded', () => {
    const formularioProductos = document.getElementById('formularioProductos');

    formularioProductos.addEventListener('submit', (evento) => {
        evento.preventDefault();

        // Recoger datos del formulario
        const nombreProducto = document.getElementById('nombreProducto').value;
        const categoriaProducto = document.getElementById('categoriaProducto').value;
        const precioProducto = document.getElementById('precioProducto').value;
        const descripcionProducto = document.getElementById('descripcionProducto').value;

        // Crear estructura XML
        const xmlDoc = new XMLDocument();
        const productoElement = xmlDoc.createElement('producto');
        
        const nombreElement = xmlDoc.createElement('nombre');
        nombreElement.textContent = nombreProducto;
        productoElement.appendChild(nombreElement);

        const categoriaElement = xmlDoc.createElement('categoria');
        categoriaElement.textContent = categoriaProducto;
        productoElement.appendChild(categoriaElement);

        const precioElement = xmlDoc.createElement('precio');
        precioElement.textContent = precioProducto;
        productoElement.appendChild(precioElement);

        const descripcionElement = xmlDoc.createElement('descripcion');
        descripcionElement.textContent = descripcionProducto;
        productoElement.appendChild(descripcionElement);

        xmlDoc.appendChild(productoElement);

        // Convertir XML a string
        const xmlString = new XMLSerializer().serializeToString(xmlDoc);
        console.log(xmlString);

        // Aquí podrías agregar lógica para enviar el XML a un backend
        alert('XML generado con éxito');
    });
});