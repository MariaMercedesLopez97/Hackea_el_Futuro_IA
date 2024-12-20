import openai
import pandas as pd
from pydantic import BaseModel, EmailStr, validator
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os
from dotenv import load_dotenv
import logging

# Cargar variables de entorno
load_dotenv()

# Inicializar el cliente de OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# Configurar logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    handlers=[
                        logging.FileHandler("proyecto.log"),
                        logging.StreamHandler()
                    ])
logger = logging.getLogger(__name__)

def main():
    try:
        # Verificar variables de entorno
        load_dotenv()
        openai_key = os.getenv("OPENAI_API_KEY")
        email_user = os.getenv("EMAIL_USER")
        email_pass = os.getenv("EMAIL_PASS")

        if not all([openai_key, email_user, email_pass]):
            raise ValueError("Faltan configuraciones en el archivo .env")

        # Datos de ejemplo
        cliente = ClienteDatos(
            nombre="Maria Lopez",
            mail="mmercedeslopez97@gmail.com",  # Usar el mismo correo configurado
            ruc="20123456789"
        )

        compra = PedidoCompra(
            cod=1234,
            descripcion="Producto de prueba del sistema",
            cantidad=1,
            precioUnitario=50,
            pesoneto=0.5,
            pesobruto=1.0
        )

        # Generar cuerpo de correo
        try:
            email_body = generate_email_body(cliente, compra)
            logger.info("Cuerpo de correo generado exitosamente")
        except Exception as e:
            logger.error(f"Error al generar correo con IA: {e}")
            email_body = f"""
            Estimado/a {cliente.nombre},
            
            Este es un correo de prueba del sistema.
            Detalles del pedido:
            - Código: {compra.cod}
            - Descripción: {compra.descripcion}
            - Cantidad: {compra.cantidad}
            
            Saludos cordiales.
            """

        # Crear archivo Excel
        excel_filename = f"pedido_{compra.cod}.xlsx"
        create_excel_file(compra, cliente, excel_filename)
        logger.info(f"Archivo Excel creado: {excel_filename}")

        # Enviar correo
        send_email_with_attachment(
            to_email=cliente.mail,
            subject=f"Prueba de Sistema - Pedido #{compra.cod}",
            body=email_body,
            filename=excel_filename
        )
        logger.info("Proceso completado exitosamente")

        print("🟢 Prueba completada exitosamente")

    except Exception as e:
        logger.error(f"Error en el proceso principal: {e}")
        print(f"🔴 Ocurrió un error: {e}")
        print("Por favor, revisa las siguientes configuraciones:")
        print("1. API Key de OpenAI")
        print("2. Credenciales de Gmail")
        print("3. Permisos de aplicaciones")

# Modelos Pydantic
class ClienteDatos(BaseModel):
    nombre: str
    mail: EmailStr
    ruc: str

    @validator('ruc')
    def validate_ruc(cls, value):
        if len(value) != 11 or not value.isdigit():
            raise ValueError("El RUC debe tener 11 dígitos.")
        return value


class PedidoCompra(BaseModel):
    cod: int
    descripcion: str
    cantidad: int
    precioUnitario: int
    precioTotal: int = 0
    pesoneto: float
    pesobruto: float

    @validator('precioTotal', always=True)
    def calculate_total(cls, value, values):
        cantidad = values.get('cantidad', 0)
        precioUnitario = values.get('precioUnitario', 0)
        return cantidad * precioUnitario


# Función para generar texto con IA

def generate_email_body(cliente: ClienteDatos, compra: PedidoCompra):
    try:
        # Usar el nuevo método de generación de completaciones
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Eres un asistente que genera correos profesionales para confirmación de pedidos."},
                {"role": "user", "content": f"Genera un correo para {cliente.nombre} sobre el pedido {compra.cod} con descripción: {compra.descripcion}"}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error al generar correo con IA: {e}")
        return "No se pudo generar el correo electrónico."

# Función para crear un archivo Excel
def create_excel_file(compra: PedidoCompra, cliente: ClienteDatos, filename: str):
    cliente_data = {
        "Nombre": [cliente.nombre],
        "Correo": [cliente.mail],
        "RUC": [cliente.ruc]
    }
    pedido_data = {
        "Código": [compra.cod],
        "Descripción": [compra.descripcion],
        "Cantidad": [compra.cantidad],
        "Precio Unitario": [compra.precioUnitario],
        "Precio Total": [compra.precioTotal],
        "Peso Neto":[compra.pesoneto],
        "Peso Bruto": [compra.pesobruto]
    }

    with pd.ExcelWriter(filename) as writer:
        pd.DataFrame(cliente_data).to_excel(writer, sheet_name="Cliente", index=False)
        pd.DataFrame(pedido_data).to_excel(writer, sheet_name="Pedido", index=False)

    print(f"Archivo Excel creado: {filename}")


# Envío de correo con archivo adjunto
def send_email_with_attachment(to_email, subject, body, filename):
    from_email = os.getenv("EMAIL_USER")
    password = os.getenv("EMAIL_PASS")

    if not from_email or not password:
        raise ValueError("Faltan las credenciales de correo en las variables de entorno.")

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    with open(filename, "rb") as attachment:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(attachment.read())
        encoders.encode_base64(part)
        part.add_header(
            "Content-Disposition",
            f"attachment; filename= {os.path.basename(filename)}",
        )
        msg.attach(part)

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(from_email, password)
        server.send_message(msg)

    print("Correo enviado con éxito.")


if __name__ == "__main__":
    main()