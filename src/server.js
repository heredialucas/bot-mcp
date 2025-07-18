import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración del servidor MCP
const server = new Server(
  {
    name: 'playwright-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Configuración del servidor HTTP
const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Almacenamiento para instancias de Playwright
let browserInstances = new Map();

// Herramientas MCP de Playwright
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'mcp_Playwright_browser_navigate',
        description: 'Navigate to a URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to navigate to'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'mcp_Playwright_browser_snapshot',
        description: 'Capture accessibility snapshot of the current page',
        inputSchema: {
          type: 'object',
          properties: {
            random_string: {
              type: 'string',
              description: 'Dummy parameter for no-parameter tools'
            }
          },
          required: ['random_string']
        }
      },
      {
        name: 'mcp_Playwright_browser_click',
        description: 'Perform click on a web page',
        inputSchema: {
          type: 'object',
          properties: {
            element: {
              type: 'string',
              description: 'Human-readable element description'
            },
            ref: {
              type: 'string',
              description: 'Exact target element reference from the page snapshot'
            },
            doubleClick: {
              type: 'boolean',
              description: 'Whether to perform a double click instead of a single click'
            },
            button: {
              type: 'string',
              enum: ['left', 'right', 'middle'],
              description: 'Button to click, defaults to left'
            }
          },
          required: ['element', 'ref']
        }
      },
      {
        name: 'mcp_Playwright_browser_type',
        description: 'Type text into editable element',
        inputSchema: {
          type: 'object',
          properties: {
            element: {
              type: 'string',
              description: 'Human-readable element description'
            },
            ref: {
              type: 'string',
              description: 'Exact target element reference from the page snapshot'
            },
            text: {
              type: 'string',
              description: 'Text to type into the element'
            },
            submit: {
              type: 'boolean',
              description: 'Whether to submit entered text (press Enter after)'
            },
            slowly: {
              type: 'boolean',
              description: 'Whether to type one character at a time'
            }
          },
          required: ['element', 'ref', 'text']
        }
      },
      {
        name: 'mcp_Playwright_browser_take_screenshot',
        description: 'Take a screenshot of the current page',
        inputSchema: {
          type: 'object',
          properties: {
            raw: {
              type: 'boolean',
              description: 'Whether to return without compression'
            },
            filename: {
              type: 'string',
              description: 'File name to save the screenshot to'
            },
            element: {
              type: 'string',
              description: 'Human-readable element description'
            },
            ref: {
              type: 'string',
              description: 'Exact target element reference from the page snapshot'
            }
          }
        }
      },
      {
        name: 'mcp_Playwright_browser_wait_for',
        description: 'Wait for text to appear or disappear or a specified time to pass',
        inputSchema: {
          type: 'object',
          properties: {
            time: {
              type: 'number',
              description: 'The time to wait in seconds'
            },
            text: {
              type: 'string',
              description: 'The text to wait for'
            },
            textGone: {
              type: 'string',
              description: 'The text to wait for to disappear'
            }
          }
        }
      }
    ]
  };
});

// Manejador para ejecutar herramientas de Playwright
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    // Aquí implementarías la lógica para ejecutar las herramientas de Playwright
    // Por ahora, simulamos la respuesta
    console.log(`Ejecutando herramienta: ${name}`, args);
    
    return {
      content: [
        {
          type: 'text',
          text: `Herramienta ${name} ejecutada con éxito`
        }
      ]
    };
  } catch (error) {
    console.error(`Error ejecutando herramienta ${name}:`, error);
    throw new Error(`Error ejecutando herramienta: ${error.message}`);
  }
});

// Endpoints HTTP para tu app de Next.js

// GET - Obtener estado del servidor
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    browserInstances: browserInstances.size
  });
});

// POST - Ejecutar acción de Playwright
app.post('/api/playwright', async (req, res) => {
  try {
    const { action, params } = req.body;
    
    console.log(`Ejecutando acción: ${action}`, params);
    
    // Aquí implementarías la lógica real de Playwright
    // Por ahora, simulamos la respuesta
    const result = {
      success: true,
      action,
      timestamp: new Date().toISOString(),
      message: `Acción ${action} ejecutada correctamente`
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error en endpoint /api/playwright:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Navegar a una URL
app.post('/api/navigate', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL es requerida'
      });
    }
    
    console.log(`Navegando a: ${url}`);
    
    // Aquí implementarías la navegación real con Playwright
    const result = {
      success: true,
      url,
      timestamp: new Date().toISOString(),
      message: `Navegación a ${url} iniciada`
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error en endpoint /api/navigate:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Tomar screenshot
app.post('/api/screenshot', async (req, res) => {
  try {
    const { filename, element, ref } = req.body;
    
    console.log('Tomando screenshot...', { filename, element, ref });
    
    // Aquí implementarías la captura real de screenshot
    const result = {
      success: true,
      filename: filename || `screenshot-${Date.now()}.png`,
      timestamp: new Date().toISOString(),
      message: 'Screenshot capturado correctamente'
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error en endpoint /api/screenshot:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Hacer clic en elemento
app.post('/api/click', async (req, res) => {
  try {
    const { element, ref, doubleClick, button } = req.body;
    
    if (!element || !ref) {
      return res.status(400).json({
        success: false,
        error: 'Element y ref son requeridos'
      });
    }
    
    console.log('Haciendo clic...', { element, ref, doubleClick, button });
    
    // Aquí implementarías el clic real con Playwright
    const result = {
      success: true,
      element,
      ref,
      doubleClick: doubleClick || false,
      button: button || 'left',
      timestamp: new Date().toISOString(),
      message: `Clic en ${element} ejecutado correctamente`
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error en endpoint /api/click:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Escribir texto
app.post('/api/type', async (req, res) => {
  try {
    const { element, ref, text, submit, slowly } = req.body;
    
    if (!element || !ref || !text) {
      return res.status(400).json({
        success: false,
        error: 'Element, ref y text son requeridos'
      });
    }
    
    console.log('Escribiendo texto...', { element, ref, text, submit, slowly });
    
    // Aquí implementarías la escritura real con Playwright
    const result = {
      success: true,
      element,
      ref,
      text,
      submit: submit || false,
      slowly: slowly || false,
      timestamp: new Date().toISOString(),
      message: `Texto "${text}" escrito en ${element} correctamente`
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error en endpoint /api/type:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Función principal
async function main() {
  try {
    // Iniciar servidor HTTP
    app.listen(HTTP_PORT, () => {
      console.log(`🚀 Servidor HTTP iniciado en puerto ${HTTP_PORT}`);
      console.log(`📡 Endpoints disponibles:`);
      console.log(`   GET  /api/status`);
      console.log(`   POST /api/playwright`);
      console.log(`   POST /api/navigate`);
      console.log(`   POST /api/screenshot`);
      console.log(`   POST /api/click`);
      console.log(`   POST /api/type`);
    });
    
    // Iniciar servidor MCP
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log('🤖 Servidor MCP iniciado y conectado');
    
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...');
  process.exit(0);
});

// Iniciar el servidor
main(); 