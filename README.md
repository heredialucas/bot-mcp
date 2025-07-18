# Bot MCP - Servidor MCP Proxy con Playwright

Este proyecto es un servidor HTTP que actúa como proxy para el servidor MCP de Playwright de ExecuteAutomation. Permite usar las herramientas MCP de Playwright a través de endpoints HTTP.

## 🎭 Características

- **Servidor MCP Proxy**: Usa el servidor MCP de Playwright existente de [@executeautomation/playwright-mcp-server](https://github.com/executeautomation/mcp-playwright)
- **Endpoints HTTP**: Acceso a herramientas MCP a través de API REST
- **Navegación web**: Navegar a URLs
- **Screenshots**: Tomar capturas de pantalla
- **Interacciones**: Click, escritura de texto
- **Snapshots**: Obtener información de accesibilidad de la página
- **JavaScript**: Ejecutar código JavaScript en la página

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd bot-mcp

# Instalar dependencias
npm install

# Los navegadores de Playwright se instalarán automáticamente
```

## 🔧 Configuración

El proyecto usa el servidor MCP de Playwright de ExecuteAutomation:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
```

## 🏃‍♂️ Uso

### Iniciar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3001`

### Endpoints disponibles

#### GET /api/status
Obtener estado del servidor

```bash
curl http://localhost:3001/api/status
```

#### POST /api/navigate
Navegar a una URL

```bash
curl -X POST http://localhost:3001/api/navigate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

#### POST /api/screenshot
Tomar screenshot

```bash
curl -X POST http://localhost:3001/api/screenshot \
  -H "Content-Type: application/json" \
  -d '{"filename": "mi-screenshot.png"}'
```

#### POST /api/snapshot
Obtener snapshot de la página

```bash
curl -X POST http://localhost:3001/api/snapshot \
  -H "Content-Type: application/json"
```

#### POST /api/click
Hacer click en un elemento

```bash
curl -X POST http://localhost:3001/api/click \
  -H "Content-Type: application/json" \
  -d '{"element": "botón de login", "ref": "button[type=submit]"}'
```

#### POST /api/type
Escribir texto

```bash
curl -X POST http://localhost:3001/api/type \
  -H "Content-Type: application/json" \
  -d '{"element": "campo de email", "ref": "input[type=email]", "text": "usuario@ejemplo.com"}'
```

#### POST /api/evaluate
Ejecutar JavaScript

```bash
curl -X POST http://localhost:3001/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{"function": "() => document.title"}'
```

#### POST /api/mcp/execute
Ejecutar cualquier herramienta MCP directamente

```bash
curl -X POST http://localhost:3001/api/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{"tool": "mcp_Playwright_browser_navigate", "args": {"url": "https://example.com"}}'
```

## 🛠️ Herramientas MCP disponibles

El servidor usa las siguientes herramientas del servidor MCP de Playwright:

- `mcp_Playwright_browser_navigate` - Navegar a URL
- `mcp_Playwright_browser_snapshot` - Obtener snapshot de la página
- `mcp_Playwright_browser_click` - Hacer click en elementos
- `mcp_Playwright_browser_type` - Escribir texto
- `mcp_Playwright_browser_take_screenshot` - Tomar screenshots
- `mcp_Playwright_browser_evaluate` - Ejecutar JavaScript

## 🌐 Despliegue en Render

El proyecto está configurado para desplegarse en Render:

1. Conecta tu repositorio a Render
2. Configura como servicio web
3. El script de build instalará automáticamente los navegadores de Playwright

## 📝 Ejemplo de uso completo

```bash
# 1. Navegar a una página
curl -X POST https://tu-app.onrender.com/api/navigate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://blogui.me/heredialucas"}'

# 2. Obtener snapshot para ver elementos
curl -X POST https://tu-app.onrender.com/api/snapshot \
  -H "Content-Type: application/json"

# 3. Hacer click en un botón (usando ref del snapshot)
curl -X POST https://tu-app.onrender.com/api/click \
  -H "Content-Type: application/json" \
  -d '{"element": "botón de login", "ref": "button[type=submit]"}'

# 4. Tomar screenshot
curl -X POST https://tu-app.onrender.com/api/screenshot \
  -H "Content-Type: application/json" \
  -d '{"filename": "resultado.png"}'
```

## 🔗 Enlaces útiles

- [Servidor MCP de Playwright](https://github.com/executeautomation/mcp-playwright)
- [Documentación MCP](https://modelcontextprotocol.io/)
- [Playwright](https://playwright.dev/)

## 📄 Licencia

MIT 