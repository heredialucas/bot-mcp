# Bot MCP - Servidor MCP de Playwright

Este proyecto implementa un servidor MCP (Model Context Protocol) oficial que proporciona herramientas de Playwright para automatización web.

## 🎭 Características

- **Servidor MCP Estándar**: Implementa el protocolo MCP oficial usando `@modelcontextprotocol/sdk`
- **Herramientas de Playwright**: Navegación, screenshots, interacciones, snapshots
- **Protocolo Estándar**: Compatible con cualquier cliente MCP
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

## 🏃‍♂️ Uso

### Iniciar el servidor MCP

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### Configuración del cliente MCP

Para usar este servidor con un cliente MCP, configura tu cliente con:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": ["src/mcp-server.js"]
    }
  }
}
```

## 🛠️ Herramientas disponibles

### mcp_Playwright_browser_navigate
Navegar a una URL.

**Parámetros:**
- `url` (string, requerido): URL a la que navegar

### mcp_Playwright_browser_snapshot
Obtener snapshot de accesibilidad de la página actual.

**Parámetros:** Ninguno

### mcp_Playwright_browser_click
Hacer click en un elemento.

**Parámetros:**
- `element` (string, requerido): Descripción del elemento
- `ref` (string, requerido): Selector CSS del elemento

### mcp_Playwright_browser_type
Escribir texto en un elemento.

**Parámetros:**
- `element` (string, requerido): Descripción del elemento
- `ref` (string, requerido): Selector CSS del elemento
- `text` (string, requerido): Texto a escribir

### mcp_Playwright_browser_take_screenshot
Tomar screenshot de la página.

**Parámetros:**
- `filename` (string, opcional): Nombre del archivo para guardar

### mcp_Playwright_browser_evaluate
Ejecutar JavaScript en la página.

**Parámetros:**
- `function` (string, requerido): Función JavaScript a ejecutar

## 📝 Ejemplo de uso

### Con un cliente MCP

```javascript
// Ejemplo de uso con un cliente MCP
const result = await client.callTool('mcp_Playwright_browser_navigate', {
  url: 'https://ejemplo.com'
});

const snapshot = await client.callTool('mcp_Playwright_browser_snapshot', {});

const clickResult = await client.callTool('mcp_Playwright_browser_click', {
  element: 'Botón de login',
  ref: 'button[data-testid="login"]'
});
```

### Flujo típico

1. **Navegar a una página**
2. **Obtener snapshot** para ver elementos disponibles
3. **Hacer click** en elementos usando selectores del snapshot
4. **Escribir texto** en formularios
5. **Tomar screenshot** del resultado

## 🌐 Despliegue

El servidor MCP se puede desplegar en cualquier plataforma que soporte Node.js:

- **Local**: Ejecutar directamente con `node src/mcp-server.js`
- **Docker**: Crear imagen con Node.js y Playwright
- **Cloud**: Render, Railway, Heroku, etc.

## 🔧 Configuración

### Variables de entorno

- `PLAYWRIGHT_HEADLESS` - Modo headless del navegador (default: true)

## 📄 Licencia

MIT

## 🔗 Enlaces útiles

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK para Node.js](https://modelcontextprotocol.io/quickstart/server#node)
- [Playwright](https://playwright.dev/) 