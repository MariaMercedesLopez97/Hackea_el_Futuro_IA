const express = require('express')
const app = express()
const PORT = 3000
const bodyParser = require('body-parser');
const fs = require('fs'); // Para guardar el XML en un archivo

const XMLGenerator = () => {
    const [formData, setFormData] = useState({
        clienteName: '',
        clienteRuc: '',
        clienteEmail: '',
        ordenCompra: [{
            numeroItem:'',
            cantidadProducto: '',
            codProducto: '',
            NCM:'', // ncm: nomenclatura comun, clasificacion de los productos a nivel internacional
            unidadMedida: '', // Puede ser unidades o cajas
            descripcionProducto: '',
            precioUnitario: '',
            precioTotal:'',
            pesoNeto: '', // Peso del producto sin embalage
            pesoBruto:'' // Peso del producto con su embalage
        }]
    })
}




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
    const xmlContent = `
<OrdenCompra>
  <Cliente>
    <Nombre>${clienteName}</Nombre>
    <RUC>${clienteRuc}</RUC>
    <Email>${clienteEmail}</Email>
  </Cliente>
  <Productos>
    ${ordenCompra.map((item, index) => `
    <Producto>
      <NumeroItem>${item.numeroItem || index + 1}</NumeroItem>
      <Descripcion>${item.descripcionProducto}</Descripcion>
      <Cantidad>${item.cantidadProducto}</Cantidad>
      <PrecioUnitario>${item.precioUnitario}</PrecioUnitario>
      <PrecioTotal>${item.cantidadProducto * item.precioUnitario}</PrecioTotal>
      <PesoNeto>${item.pesoNeto}</PesoNeto>
      <PesoBruto>${item.pesoBruto}</PesoBruto>
    </Producto>`).join('')}
  </Productos>
</OrdenCompra>`;

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

