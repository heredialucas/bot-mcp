import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { chromium } from 'playwright';

// Crear instancia del navegador
let browser = null;
let page = null;

// Inicializar navegador
async function initBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
  }
  return { browser, page };
}

// Servidor MCP
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

// Herramienta: Navegar a una URL
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const { page } = await initBrowser();

    switch (name) {
      case 'mcp_Playwright_browser_navigate':
        await page.goto(args.url);
        return {
          content: [
            {
              type: 'text',
              text: `Navegado exitosamente a ${args.url}`,
            },
          ],
        };

      case 'mcp_Playwright_browser_snapshot':
        const snapshot = await page.accessibility.snapshot();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(snapshot, null, 2),
            },
          ],
        };

      case 'mcp_Playwright_browser_click':
        const element = await page.locator(args.ref).first();
        await element.click();
        return {
          content: [
            {
              type: 'text',
              text: `Click exitoso en elemento: ${args.element}`,
            },
          ],
        };

      case 'mcp_Playwright_browser_type':
        const inputElement = await page.locator(args.ref).first();
        await inputElement.fill(args.text);
        return {
          content: [
            {
              type: 'text',
              text: `Texto escrito exitosamente: ${args.text}`,
            },
          ],
        };

      case 'mcp_Playwright_browser_take_screenshot':
        const screenshot = await page.screenshot({ 
          path: args.filename || `screenshot-${Date.now()}.png` 
        });
        return {
          content: [
            {
              type: 'text',
              text: `Screenshot guardado: ${args.filename || `screenshot-${Date.now()}.png`}`,
            },
          ],
        };

      case 'mcp_Playwright_browser_evaluate':
        const result = await page.evaluate(args.function);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };

      default:
        throw new Error(`Herramienta no reconocida: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
    };
  }
});

// Listar herramientas disponibles
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'mcp_Playwright_browser_navigate',
        description: 'Navegar a una URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL a la que navegar',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'mcp_Playwright_browser_snapshot',
        description: 'Obtener snapshot de accesibilidad de la página',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'mcp_Playwright_browser_click',
        description: 'Hacer click en un elemento',
        inputSchema: {
          type: 'object',
          properties: {
            element: {
              type: 'string',
              description: 'Descripción del elemento',
            },
            ref: {
              type: 'string',
              description: 'Selector CSS del elemento',
            },
          },
          required: ['element', 'ref'],
        },
      },
      {
        name: 'mcp_Playwright_browser_type',
        description: 'Escribir texto en un elemento',
        inputSchema: {
          type: 'object',
          properties: {
            element: {
              type: 'string',
              description: 'Descripción del elemento',
            },
            ref: {
              type: 'string',
              description: 'Selector CSS del elemento',
            },
            text: {
              type: 'string',
              description: 'Texto a escribir',
            },
          },
          required: ['element', 'ref', 'text'],
        },
      },
      {
        name: 'mcp_Playwright_browser_take_screenshot',
        description: 'Tomar screenshot de la página',
        inputSchema: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description: 'Nombre del archivo para guardar el screenshot',
            },
          },
        },
      },
      {
        name: 'mcp_Playwright_browser_evaluate',
        description: 'Ejecutar JavaScript en la página',
        inputSchema: {
          type: 'object',
          properties: {
            function: {
              type: 'string',
              description: 'Función JavaScript a ejecutar',
            },
          },
          required: ['function'],
        },
      },
    ],
  };
});

// Manejar cierre del servidor
process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

// Iniciar servidor
const transport = new StdioServerTransport();
await server.connect(transport);

console.log('🚀 Servidor MCP de Playwright iniciado');
console.log('📡 Herramientas disponibles:');
console.log('   - mcp_Playwright_browser_navigate');
console.log('   - mcp_Playwright_browser_snapshot');
console.log('   - mcp_Playwright_browser_click');
console.log('   - mcp_Playwright_browser_type');
console.log('   - mcp_Playwright_browser_take_screenshot');
console.log('   - mcp_Playwright_browser_evaluate'); 