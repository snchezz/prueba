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
