# Capturador diario de sitios web

Esta aplicación proporciona un CRUD para gestionar sitios web, captura de pantallas diaria automática y un resumen mensual en PDF que se envía por correo electrónico.

## Características

- API REST construida con FastAPI para crear, listar, actualizar y eliminar sitios web.
- Captura de pantallas diaria a las 10:00 (configurable mediante variables de entorno).
- Envío por correo electrónico de cada captura con la fecha y hora de generación.
- Generación automática de un PDF con las últimas 30 capturas y envío del resumen por correo.
- Almacenamiento en SQLite por defecto (configurable).

## Requisitos

- Python 3.10+
- Dependencias indicadas en `requirements.txt`.
- Un servidor SMTP accesible para el envío de correos (puedes usar uno local para pruebas).
- Playwright requiere la instalación de los navegadores (`playwright install`).

## Instalación

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

## Variables de entorno

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| `DATABASE_URL` | URL de conexión a la base de datos | `sqlite:///app.db` |
| `SMTP_HOST` | Host del servidor SMTP | `localhost` |
| `SMTP_PORT` | Puerto del servidor SMTP | `1025` |
| `SMTP_USERNAME` | Usuario SMTP | vacío |
| `SMTP_PASSWORD` | Contraseña SMTP | vacío |
| `SMTP_USE_TLS` | Activa TLS si es `true` | `false` |
| `SCREENSHOT_DIR` | Ruta de almacenamiento de capturas | `storage/screenshots` |
| `PDF_DIR` | Ruta de almacenamiento de PDFs | `storage/pdfs` |
| `DAILY_CAPTURE_HOUR` | Hora de la captura diaria | `10` |
| `DAILY_CAPTURE_MINUTE` | Minuto de la captura diaria | `0` |
| `DIGEST_DAYS` | Número de días para el resumen | `30` |

## Uso

1. Inicia el servidor de desarrollo:

```bash
uvicorn app.main:app --reload
```

2. Accede a la documentación interactiva en `http://localhost:8000/docs` para utilizar el CRUD.

3. El planificador (`APScheduler`) iniciará automáticamente al arrancar la aplicación y ejecutará la captura diaria a la hora configurada.

4. Las capturas se almacenan en `storage/screenshots/<id_del_sitio>/` y los PDFs en `storage/pdfs/`.

### Envío de correo

El módulo de correo utiliza `smtplib`. Para pruebas locales puedes ejecutar un servidor SMTP temporal:

```bash
python -m smtpd -c DebuggingServer -n localhost:1025
```

### Ajustes de resumen mensual

El resumen se genera cuando existen al menos `DIGEST_DAYS` capturas posteriores al último envío de resumen. El PDF se crea con `reportlab` y adjunta las capturas en páginas separadas.

## Tareas programadas

- **Captura diaria**: realiza la captura de cada sitio activo, almacena la imagen y envía un correo con la captura del día.
- **Resumen 30 días**: tras añadir la captura diaria, si existen 30 capturas sin resumen se genera el PDF y se envía automáticamente.

## Desarrollo

- La base de datos se inicializa automáticamente al arrancar el servidor.
- El scheduler trabaja en el mismo proceso que FastAPI mediante `AsyncIOScheduler`.
- Las capturas se realizan con Playwright en modo headless.

## Advertencias

- El proceso de captura y envío se ejecuta de forma secuencial; si necesitas alta concurrencia considera moverlo a colas de tareas.
- Asegúrate de almacenar las credenciales SMTP de forma segura.
