# Bot MCP con Playwright

Servidor MCP (Model Context Protocol) que integra herramientas de Playwright y expone una API HTTP para recibir llamadas desde tu aplicación Next.js.

## Características

- 🤖 Servidor MCP con herramientas de Playwright
- 🌐 API HTTP REST para integración con Next.js
- 🖱️ Navegación, clics, escritura de texto y screenshots
- 📸 Captura de snapshots de accesibilidad
- ⏱️ Funciones de espera y temporización

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Instalar navegadores de Playwright:
```bash
npx playwright install
```

3. Crear archivo `.env` (opcional):
```env
HTTP_PORT=3001
PLAYWRIGHT_BROWSER=chromium
PLAYWRIGHT_HEADLESS=false
```

## Uso

### Iniciar el servidor

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor se iniciará en:
- **MCP**: stdio (para comunicación con clientes MCP)
- **HTTP**: puerto 3001 (para tu app Next.js)

### Endpoints HTTP disponibles

#### GET `/api/status`
Obtener el estado del servidor.

#### POST `/api/navigate`
Navegar a una URL.

```json
{
  "url": "https://example.com"
}
```

#### POST `/api/screenshot`
Tomar una captura de pantalla.

```json
{
  "filename": "mi-screenshot.png",
  "element": "botón de login",
  "ref": "element-ref-id"
}
```

#### POST `/api/click`
Hacer clic en un elemento.

```json
{
  "element": "botón de submit",
  "ref": "element-ref-id",
  "doubleClick": false,
  "button": "left"
}
```

#### POST `/api/type`
Escribir texto en un elemento.

```json
{
  "element": "campo de email",
  "ref": "element-ref-id",
  "text": "usuario@example.com",
  "submit": false,
  "slowly": false
}
```

#### POST `/api/playwright`
Ejecutar acciones genéricas de Playwright.

```json
{
  "action": "navigate",
  "params": {
    "url": "https://example.com"
  }
}
```

## Herramientas MCP disponibles

- `mcp_Playwright_browser_navigate` - Navegar a URL
- `mcp_Playwright_browser_snapshot` - Capturar snapshot
- `mcp_Playwright_browser_click` - Hacer clic
- `mcp_Playwright_browser_type` - Escribir texto
- `mcp_Playwright_browser_take_screenshot` - Tomar screenshot
- `mcp_Playwright_browser_wait_for` - Esperar elementos

## Integración con Next.js

Desde tu aplicación Next.js, puedes hacer llamadas al servidor:

```javascript
// Ejemplo de navegación
const response = await fetch('http://localhost:3001/api/navigate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com'
  })
});

const result = await response.json();
console.log(result);
```

## Configuración MCP

Para usar este servidor con un cliente MCP, agrega esta configuración:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": ["src/server.js"],
      "env": {
        "HTTP_PORT": "3001"
      }
    }
  }
}
```

## Desarrollo

El servidor está estructurado para facilitar la extensión:

1. **Herramientas MCP**: Agregar nuevas herramientas en el manejador `tools/list`
2. **Endpoints HTTP**: Agregar nuevos endpoints en la sección de Express
3. **Lógica de Playwright**: Implementar la lógica real en los manejadores de herramientas

## Notas

- El servidor actualmente simula las respuestas de Playwright
- Para implementar la funcionalidad real, necesitarás agregar la lógica de Playwright en los manejadores correspondientes
- Las instancias de navegador se almacenan en memoria (Map)
- Considera implementar persistencia para sesiones de navegador 