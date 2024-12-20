const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const xmlbuilder = require('xmlbuilder');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'vistas')));

// Función para generar XML
const generateXML = (formData) => {
    try {
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
                .end({ pretty: true });

        return xmlContent;
    } catch (error) {
        console.error('Error generando XML:', error);
        throw new Error('No se pudo generar el XML');
    }
};

// Ruta para generar y guardar XML
app.post('/generate-xml', (req, res) => {
    try {
        const { 
            clienteName, 
            clienteRuc, 
            clienteEmail, 
            NumeroItem, 
            Descripcion, 
            Cantidad, 
            PrecioUnitario, 
            PrecioTotal, 
            PesoNeto, 
            PesoBruto 
        } = req.body;

        // Validación de datos
        if (!clienteName || !clienteRuc || !clienteEmail) {
            return res.status(400).json({ 
                error: 'Faltan datos obligatorios del cliente' 
            });
        }

        // Generar XML
        const xmlContent = generateXML(req.body);

        // Guardar XML en archivo
        const filename = `orden_compra_${Date.now()}.xml`;
        const filepath = path.join(__dirname, 'ordenes', filename);
        
        // Crear directorio si no existe
        if (!fs.existsSync(path.join(__dirname, 'ordenes'))) {
            fs.mkdirSync(path.join(__dirname, 'ordenes'));
        }

        fs.writeFileSync(filepath, xmlContent);

        // Responder con éxito
        res.status(200).json({
            message: 'XML generado exitosamente',
            filename: filename,
            xmlContent: xmlContent
        });

    } catch (error) {
        console.error('Error en /generate-xml:', error);
        res.status(500).json({ 
            error: 'Error interno al generar XML', 
            details: error.message 
        });
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'vistas', 'index.html'));
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Accede en: http://localhost:${PORT}`);
});

// Exportar para testing o modularidad
module.exports = app;