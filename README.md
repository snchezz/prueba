<<<<<<< codex/create-web-capture-crud-application-ve7quj
# Web Monitoring Platform

Aplicación web completa para registrar sitios web, capturarlos diariamente y enviar informes por correo electrónico.

## Características

- CRUD para administrar los sitios web a monitorizar y el correo de destino.
- Captura automática diaria (10:00) de cada sitio mediante Puppeteer.
- Envío del pantallazo diario por correo electrónico.
- Digest mensual en PDF con las últimas 30 capturas.
- Interfaz web sencilla incluida (sin dependencias externas) para gestionar los registros.

## Requisitos previos

- Node.js 18 o superior.
- Navegador Chromium disponible (Puppeteer descarga uno automáticamente en la instalación).
- Credenciales SMTP válidas para el envío de correos.

### Dependencias del navegador (Linux)

Si el servidor es Linux sin entorno gráfico, instala las bibliotecas de Chromium antes de lanzar las capturas:

```bash
sudo apt-get update
sudo apt-get install -y \
  libatk-bridge2.0-0 libatk1.0-0 libcairo2 libcups2 libdrm2 \
  libgbm1 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
  libxrandr2 libasound2 libnss3 libx11-xcb1
```

Puppeteer mostrará un error similar a `error while loading shared libraries` si falta alguna dependencia.

## Configuración

1. Clona el repositorio y entra en la carpeta del proyecto.
   ```bash
   git clone <tu-fork>
   cd prueba
   ```
2. Crea el archivo de variables de entorno.
   ```bash
   cp .env.example .env
   ```
3. Edita `.env` con tu configuración:
   - `PORT`: puerto del servidor web.
   - `TIMEZONE`: zona horaria IANA usada por el planificador (por defecto `Europe/Madrid`).
   - Credenciales SMTP (`SMTP_*`).
   - Opcionalmente `CHROME_EXECUTABLE_PATH` si deseas usar un navegador existente.
4. Instala dependencias.
   ```bash
   npm install
   ```

## Uso

1. Inicia el servidor.
   ```bash
   npm run dev
   ```
2. Abre tu navegador y visita `http://localhost:3000` (o el puerto configurado).
3. Desde la interfaz podrás:
   - Añadir nuevas webs introduciendo la URL y el correo destinatario.
   - Editar o eliminar webs existentes.
   - Consultar el historial de capturas de cada web.

El planificador arranca automáticamente al iniciar el servidor. A las 10:00 de cada día (según `TIMEZONE`) se realizará la captura, se enviará un correo con la imagen y, tras acumular 30 capturas, se generará y enviará un PDF.

## Scripts disponibles

- `npm start`: ejecuta el servidor en modo producción.
- `npm run dev`: usa `nodemon` para reiniciar el servidor en caliente.
- `npm run check`: validación sintáctica rápida de los archivos JavaScript.

## Estructura del proyecto

```
prueba/
├── public/              # Interfaz web
├── scripts/             # Utilidades (p. ej. verificación sintáctica)
├── src/                 # Código del backend Express
│   ├── routes/
│   ├── services/
│   ├── scheduler.js
│   ├── server.js
│   └── ...
└── storage/             # Capturas y digest generados (ignorado por git)
```

## Notas

- Las capturas, PDFs y datos de la aplicación se guardan en `storage/`. Se recomienda montar un volumen persistente en despliegues productivos.
- Si no se configura SMTP, los envíos de correo se omitirán (se registrará un aviso en consola).
- Para entornos sin interfaz gráfica, establece `CHROME_EXECUTABLE_PATH` a un binario de Chromium válido o usa Puppeteer con `PUPPETEER_EXECUTABLE_PATH`.
=======
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
>>>>>>> main
