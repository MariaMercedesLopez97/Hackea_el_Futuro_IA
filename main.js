const express = require('express')
const app = express()
const PORT = 3000
const bodyParser = require('body-parser');
const fs = require('fs'); // Para guardar el XML en un archivo

const xmlbuilder = require('xmlbuilder');






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

