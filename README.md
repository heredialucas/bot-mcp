# Bot MCP - Servidor HTTP con MCP de Playwright

Este proyecto implementa un servidor HTTP que actúa como wrapper del servidor MCP (Model Context Protocol) oficial, proporcionando endpoints REST para usar herramientas de Playwright desde aplicaciones web como Next.js.

## 🎭 Características

- **Servidor HTTP**: Endpoints REST para usar desde Next.js u otras aplicaciones
- **Servidor MCP Interno**: Usa el protocolo MCP oficial internamente
- **Herramientas de Playwright**: Navegación, screenshots, interacciones, snapshots
- **Endpoint `/api/execute-task`**: Para ejecutar tareas específicas en URLs
- **Compatible con Render**: Despliegue automático en la nube

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

### Iniciar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3001`

## 📡 Endpoints disponibles

### GET /api/status
Obtener el estado del servidor.

```bash
curl https://tu-app.onrender.com/api/status
```

### POST /api/execute-task
**¡El endpoint principal!** Ejecutar tareas específicas en una URL.

```bash
curl -X POST https://tu-app.onrender.com/api/execute-task \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://blogui.me/heredialucas",
    "task": "get_forms"
  }'
```

**Tareas disponibles:**
- `get_title` - Obtener título de la página
- `get_meta` - Obtener meta tags
- `get_headers` - Obtener encabezados H1-H6
- `get_links` - Obtener todos los enlaces
- `get_images` - Obtener todas las imágenes
- `get_forms` - Obtener formularios y sus campos
- `get_text` - Obtener texto completo de la página
- `get_all` - Obtener toda la información

### POST /api/navigate
Navegar a una URL.

```bash
curl -X POST https://tu-app.onrender.com/api/navigate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://ejemplo.com"}'
```

### POST /api/snapshot
Obtener snapshot de accesibilidad de la página actual.

```bash
curl -X POST https://tu-app.onrender.com/api/snapshot
```

### POST /api/click
Hacer click en un elemento.

```bash
curl -X POST https://tu-app.onrender.com/api/click \
  -H "Content-Type: application/json" \
  -d '{
    "element": "Botón de login",
    "ref": "button[data-testid=\"login\"]"
  }'
```

### POST /api/type
Escribir texto en un elemento.

```bash
curl -X POST https://tu-app.onrender.com/api/type \
  -H "Content-Type: application/json" \
  -d '{
    "element": "Campo de email",
    "ref": "input[type=\"email\"]",
    "text": "usuario@ejemplo.com"
  }'
```

### POST /api/screenshot
Tomar screenshot de la página.

```bash
curl -X POST https://tu-app.onrender.com/api/screenshot \
  -H "Content-Type: application/json" \
  -d '{"filename": "mi-screenshot.png"}'
```

### POST /api/evaluate
Ejecutar JavaScript en la página.

```bash
curl -X POST https://tu-app.onrender.com/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{"function": "() => document.title"}'
```

## 🔗 Uso desde Next.js

### Ejemplo básico

```javascript
// pages/api/scrape.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, task } = req.body;

  try {
    const response = await fetch('https://tu-app.onrender.com/api/execute-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, task }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Ejemplo con formularios

```javascript
// pages/api/get-forms.js
export default async function handler(req, res) {
  const { url } = req.body;

  try {
    const response = await fetch('https://tu-app.onrender.com/api/execute-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url, 
        task: 'get_forms' 
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      res.status(200).json({
        forms: data.result.forms,
        message: 'Formularios encontrados'
      });
    } else {
      res.status(400).json({ error: data.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### Ejemplo con navegación y clicks

```javascript
// pages/api/automate.js
export default async function handler(req, res) {
  const { url, actions } = req.body;

  try {
    // 1. Navegar a la URL
    await fetch('https://tu-app.onrender.com/api/navigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    // 2. Ejecutar acciones
    for (const action of actions) {
      if (action.type === 'click') {
        await fetch('https://tu-app.onrender.com/api/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            element: action.element,
            ref: action.ref
          }),
        });
      } else if (action.type === 'type') {
        await fetch('https://tu-app.onrender.com/api/type', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            element: action.element,
            ref: action.ref,
            text: action.text
          }),
        });
      }
    }

    // 3. Tomar screenshot del resultado
    const screenshotResponse = await fetch('https://tu-app.onrender.com/api/screenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: 'resultado.png' }),
    });

    const screenshotData = await screenshotResponse.json();

    res.status(200).json({
      success: true,
      message: 'Automación completada',
      screenshot: screenshotData.result
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## 🌐 Despliegue en Render

El proyecto está configurado para desplegarse automáticamente en Render:

1. Conecta tu repositorio a Render
2. Configura como servicio web
3. El script de build instalará automáticamente los navegadores de Playwright

**URL del servidor desplegado:** `https://bot-mcp.onrender.com`

## 📝 Ejemplos de uso

### Obtener formularios de login

```bash
curl -X POST https://bot-mcp.onrender.com/api/execute-task \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://blogui.me/heredialucas",
    "task": "get_forms"
  }'
```

### Obtener toda la información de una página

```bash
curl -X POST https://bot-mcp.onrender.com/api/execute-task \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://ejemplo.com",
    "task": "get_all"
  }'
```

### Navegar y hacer click

```bash
# 1. Navegar
curl -X POST https://bot-mcp.onrender.com/api/navigate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://ejemplo.com"}'

# 2. Hacer click
curl -X POST https://bot-mcp.onrender.com/api/click \
  -H "Content-Type: application/json" \
  -d '{
    "element": "Botón de login",
    "ref": "button[type=\"submit\"]"
  }'
```

## 🔧 Configuración

### Variables de entorno

- `HTTP_PORT` - Puerto del servidor HTTP (default: 3001)
- `PLAYWRIGHT_HEADLESS` - Modo headless del navegador (default: true)

## 📄 Licencia

MIT

## 🔗 Enlaces útiles

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK para Node.js](https://modelcontextprotocol.io/quickstart/server#node)
- [Playwright](https://playwright.dev/) 