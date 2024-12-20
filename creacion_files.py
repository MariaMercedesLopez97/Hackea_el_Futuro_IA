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

# Cargar variables de entorno
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

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
def generate_email_body(cliente: ClienteDatos, compra: PedidoCompra) -> str:
    prompt = f"""
    Genera un correo formal para el cliente {cliente.nombre} con correo {cliente.mail}.
    Incluye los detalles del pedido:
    - Código: {compra.cod}
    - Descripción: {compra.descripcion}
    - Cantidad: {compra.cantidad}
    - Precio Unitario: {compra.precioUnitario}
    - Precio Total: {compra.precioTotal}
    Agradece al cliente por su compra y menciónale que puede contactarnos si tiene alguna duda.
    """

    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=150,
        temperature=0.7
    )

    return response.choices[0].text.strip()


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