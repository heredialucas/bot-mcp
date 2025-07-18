import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chromium, firefox, webkit } from 'playwright';
import { execSync } from 'child_process';

// Cargar variables de entorno
dotenv.config();

// Función para instalar navegadores si no están disponibles
async function installBrowsersIfNeeded() {
  try {
    console.log('🔍 Verificando si los navegadores de Playwright están instalados...');
    
    // Intentar lanzar chromium para verificar si está instalado
    const browser = await chromium.launch({ headless: true });
    await browser.close();
    console.log('✅ Los navegadores de Playwright ya están instalados');
  } catch (error) {
    console.log('❌ Los navegadores de Playwright no están instalados. Instalando...');
    try {
      execSync('npx playwright install chromium', { stdio: 'inherit' });
      console.log('✅ Navegadores instalados correctamente');
    } catch (installError) {
      console.error('❌ Error al instalar navegadores:', installError.message);
    }
  }
}

// Configuración del servidor HTTP
const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Almacenamiento para instancias de Playwright
let browserInstances = new Map();
let pageInstances = new Map();

// Función para obtener el navegador
async function getBrowser(browserType = 'chromium') {
  const browserId = `browser-${browserType}`;
  
  if (!browserInstances.has(browserId)) {
    let browser;
    switch (browserType) {
      case 'firefox':
        browser = await firefox.launch({ 
          headless: true 
        });
        break;
      case 'webkit':
        browser = await webkit.launch({ 
          headless: true 
        });
        break;
      default:
        browser = await chromium.launch({ 
          headless: true 
        });
    }
    browserInstances.set(browserId, browser);
  }
  
  return browserInstances.get(browserId);
}

// Función para obtener una página
async function getPage(browserType = 'chromium') {
  const browser = await getBrowser(browserType);
  const page = await browser.newPage();
  
  // Configurar user agent
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  return page;
}

// Endpoints HTTP para tu app de Next.js

// GET - Probar que Playwright funciona
app.get('/api/test', async (req, res) => {
  try {
    console.log('🧪 Probando funcionalidad de Playwright...');
    
    const page = await getPage('chromium');
    await page.goto('https://example.com', { waitUntil: 'networkidle' });
    
    const title = await page.title();
    const url = page.url();
    
    await page.close();
    
    const result = {
      success: true,
      message: 'Playwright funciona correctamente',
      test: {
        title: title,
        url: url,
        timestamp: new Date().toISOString()
      }
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error en test de Playwright:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error al probar Playwright'
    });
  }
});

// GET - Obtener estado del servidor
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    browserInstances: browserInstances.size,
    pageInstances: pageInstances.size,
    message: 'Servidor MCP con Playwright funcionando correctamente'
  });
});

// GET - Listar herramientas disponibles
app.get('/api/tools', (req, res) => {
  res.json({
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
            },
            browserType: {
              type: 'string',
              enum: ['chromium', 'firefox', 'webkit'],
              description: 'Browser type to use'
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
  });
});

// POST - Navegar a una URL (con funcionalidad real)
app.post('/api/navigate', async (req, res) => {
  try {
    const { url, browserType = 'chromium' } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL es requerida'
      });
    }
    
    console.log(`Navegando a: ${url} con ${browserType}`);
    
    const page = await getPage(browserType);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    const title = await page.title();
    const currentUrl = page.url();
    
    const result = {
      success: true,
      url: currentUrl,
      title: title,
      browserType: browserType,
      timestamp: new Date().toISOString(),
      message: `Navegación a ${url} completada exitosamente`
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

// POST - Hacer scraping de una página
app.post('/api/scrape', async (req, res) => {
  try {
    const { url, selectors, browserType = 'chromium' } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL es requerida'
      });
    }
    
    console.log(`Haciendo scraping de: ${url}`);
    
    const page = await getPage(browserType);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    const scrapedData = {};
    
    if (selectors) {
      for (const [key, selector] of Object.entries(selectors)) {
        try {
          const element = await page.$(selector);
          if (element) {
            scrapedData[key] = await element.textContent();
          } else {
            scrapedData[key] = null;
          }
        } catch (error) {
          scrapedData[key] = `Error: ${error.message}`;
        }
      }
    } else {
      // Scraping básico si no se especifican selectores
      scrapedData.title = await page.title();
      scrapedData.url = page.url();
      scrapedData.headings = await page.$$eval('h1, h2, h3', elements => 
        elements.map(el => ({ tag: el.tagName, text: el.textContent }))
      );
      scrapedData.links = await page.$$eval('a[href]', elements => 
        elements.map(el => ({ text: el.textContent, href: el.href })).slice(0, 10)
      );
    }
    
    const result = {
      success: true,
      url: page.url(),
      scrapedData,
      timestamp: new Date().toISOString(),
      message: 'Scraping completado exitosamente'
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error en endpoint /api/scrape:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Iniciar sesión en una página
app.post('/api/login', async (req, res) => {
  try {
    const { url, username, password, usernameSelector, passwordSelector, submitSelector, browserType = 'chromium' } = req.body;
    
    if (!url || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'URL, username y password son requeridos'
      });
    }
    
    console.log(`Iniciando sesión en: ${url}`);
    
    const page = await getPage(browserType);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Esperar a que los campos de login estén disponibles
    await page.waitForSelector(usernameSelector || 'input[type="email"], input[name="email"], input[name="username"]');
    await page.waitForSelector(passwordSelector || 'input[type="password"]');
    
    // Llenar los campos
    await page.fill(usernameSelector || 'input[type="email"], input[name="email"], input[name="username"]', username);
    await page.fill(passwordSelector || 'input[type="password"]', password);
    
    // Enviar el formulario
    if (submitSelector) {
      await page.click(submitSelector);
    } else {
      await page.press(passwordSelector || 'input[type="password"]', 'Enter');
    }
    
    // Esperar a que la navegación se complete
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    const title = await page.title();
    
    const result = {
      success: true,
      url: currentUrl,
      title: title,
      timestamp: new Date().toISOString(),
      message: 'Inicio de sesión completado'
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error en endpoint /api/login:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Tomar screenshot (con funcionalidad real)
app.post('/api/screenshot', async (req, res) => {
  try {
    const { url, filename, element, ref, browserType = 'chromium' } = req.body;
    
    console.log('Tomando screenshot...', { url, filename, element, ref });
    
    let page;
    
    if (url) {
      // Si se proporciona URL, navegar y tomar screenshot
      page = await getPage(browserType);
      await page.goto(url, { waitUntil: 'networkidle' });
    } else {
      // Usar página existente (necesitarías implementar gestión de páginas)
      return res.status(400).json({
        success: false,
        error: 'URL es requerida para tomar screenshot'
      });
    }
    
    const screenshotFilename = filename || `screenshot-${Date.now()}.png`;
    
    // Tomar screenshot
    await page.screenshot({ 
      path: screenshotFilename,
      fullPage: true 
    });
    
    const result = {
      success: true,
      filename: screenshotFilename,
      url: page.url(),
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

// POST - Hacer clic en elemento (con funcionalidad real)
app.post('/api/click', async (req, res) => {
  try {
    const { url, selector, doubleClick, button, browserType = 'chromium' } = req.body;
    
    if (!url || !selector) {
      return res.status(400).json({
        success: false,
        error: 'URL y selector son requeridos'
      });
    }
    
    console.log('Haciendo clic...', { url, selector, doubleClick, button });
    
    const page = await getPage(browserType);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Esperar a que el elemento esté disponible
    await page.waitForSelector(selector);
    
    // Hacer clic
    if (doubleClick) {
      await page.dblclick(selector);
    } else {
      await page.click(selector, { button: button || 'left' });
    }
    
    // Esperar a que la acción se complete
    await page.waitForLoadState('networkidle');
    
    const result = {
      success: true,
      selector,
      doubleClick: doubleClick || false,
      button: button || 'left',
      currentUrl: page.url(),
      timestamp: new Date().toISOString(),
      message: `Clic en ${selector} ejecutado correctamente`
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

// POST - Escribir texto (con funcionalidad real)
app.post('/api/type', async (req, res) => {
  try {
    const { url, selector, text, submit, slowly, browserType = 'chromium' } = req.body;
    
    if (!url || !selector || !text) {
      return res.status(400).json({
        success: false,
        error: 'URL, selector y text son requeridos'
      });
    }
    
    console.log('Escribiendo texto...', { url, selector, text, submit, slowly });
    
    const page = await getPage(browserType);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Esperar a que el elemento esté disponible
    await page.waitForSelector(selector);
    
    // Escribir texto
    if (slowly) {
      await page.type(selector, text, { delay: 100 });
    } else {
      await page.fill(selector, text);
    }
    
    // Enviar si se solicita
    if (submit) {
      await page.press(selector, 'Enter');
      await page.waitForLoadState('networkidle');
    }
    
    const result = {
      success: true,
      selector,
      text,
      submit: submit || false,
      slowly: slowly || false,
      currentUrl: page.url(),
      timestamp: new Date().toISOString(),
      message: `Texto "${text}" escrito en ${selector} correctamente`
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

// POST - Ejecutar herramienta MCP
app.post('/api/mcp/tools/call', async (req, res) => {
  try {
    const { name, arguments: args } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Nombre de herramienta es requerido'
      });
    }
    
    console.log(`Ejecutando herramienta MCP: ${name}`, args);
    
    // Aquí implementarías la lógica para ejecutar las herramientas de Playwright
    // Por ahora, simulamos la respuesta
    const result = {
      success: true,
      tool: name,
      arguments: args,
      timestamp: new Date().toISOString(),
      content: [
        {
          type: 'text',
          text: `Herramienta ${name} ejecutada con éxito`
        }
      ]
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error ejecutando herramienta MCP:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Ejecutar tarea específica en una URL
app.post('/api/execute-task', async (req, res) => {
  try {
    const { url, task, browserType = 'chromium' } = req.body;
    
    if (!url || !task) {
      return res.status(400).json({
        success: false,
        error: 'URL y task son requeridos'
      });
    }
    
    console.log(`Ejecutando tarea en: ${url}`);
    console.log(`Tarea: ${task}`);
    
    const page = await getPage(browserType);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    let result = {
      success: true,
      url: page.url(),
      task: task,
      timestamp: new Date().toISOString(),
      data: {}
    };
    
    // Ejecutar tarea según el tipo
    switch (task.toLowerCase()) {
      case 'get_title':
        result.data.title = await page.title();
        result.message = 'Título obtenido correctamente';
        break;
        
      case 'get_content':
        result.data.content = await page.textContent('body');
        result.message = 'Contenido obtenido correctamente';
        break;
        
      case 'get_headings':
        result.data.headings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => 
          elements.map(el => ({ tag: el.tagName, text: el.textContent.trim() }))
        );
        result.message = 'Encabezados obtenidos correctamente';
        break;
        
      case 'get_links':
        result.data.links = await page.$$eval('a[href]', elements => 
          elements.map(el => ({ text: el.textContent.trim(), href: el.href }))
        );
        result.message = 'Enlaces obtenidos correctamente';
        break;
        
      case 'get_images':
        result.data.images = await page.$$eval('img', elements => 
          elements.map(el => ({ src: el.src, alt: el.alt, title: el.title }))
        );
        result.message = 'Imágenes obtenidas correctamente';
        break;
        
      case 'get_meta':
        result.data.meta = await page.$$eval('meta', elements => 
          elements.map(el => ({ name: el.name, content: el.content, property: el.getAttribute('property') }))
        );
        result.message = 'Meta tags obtenidos correctamente';
        break;
        
      case 'get_text':
        result.data.text = await page.$$eval('p, div, span, article, section', elements => 
          elements.map(el => el.textContent.trim()).filter(text => text.length > 10)
        );
        result.message = 'Texto obtenido correctamente';
        break;
        
      case 'get_forms':
        result.data.forms = await page.$$eval('form', elements => 
          elements.map(el => ({ 
            action: el.action, 
            method: el.method,
            inputs: Array.from(el.querySelectorAll('input')).map(input => ({
              type: input.type,
              name: input.name,
              placeholder: input.placeholder
            }))
          }))
        );
        result.message = 'Formularios obtenidos correctamente';
        break;
        
      case 'get_all':
        result.data = {
          title: await page.title(),
          headings: await page.$$eval('h1, h2, h3, h4, h5, h6', elements => 
            elements.map(el => ({ tag: el.tagName, text: el.textContent.trim() }))
          ),
          links: await page.$$eval('a[href]', elements => 
            elements.map(el => ({ text: el.textContent.trim(), href: el.href }))
          ),
          images: await page.$$eval('img', elements => 
            elements.map(el => ({ src: el.src, alt: el.alt, title: el.title }))
          ),
          text: await page.$$eval('p, div, span, article, section', elements => 
            elements.map(el => el.textContent.trim()).filter(text => text.length > 10)
          )
        };
        result.message = 'Toda la información obtenida correctamente';
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: `Tarea '${task}' no reconocida. Tareas disponibles: get_title, get_content, get_headings, get_links, get_images, get_meta, get_text, get_forms, get_all`
        });
    }
    
    await page.close();
    res.json(result);
    
  } catch (error) {
    console.error('Error ejecutando tarea:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Función principal
async function main() {
  try {
    // Instalar navegadores si es necesario
    await installBrowsersIfNeeded();
    
    // Iniciar servidor HTTP
    app.listen(HTTP_PORT, () => {
      console.log(`🚀 Servidor HTTP iniciado en puerto ${HTTP_PORT}`);
      console.log(`📡 Endpoints disponibles:`);
      console.log(`   GET  /api/status`);
      console.log(`   GET  /api/test`);
      console.log(`   GET  /api/tools`);
      console.log(`   POST /api/navigate`);
      console.log(`   POST /api/scrape`);
      console.log(`   POST /api/login`);
      console.log(`   POST /api/screenshot`);
      console.log(`   POST /api/click`);
      console.log(`   POST /api/type`);
      console.log(`   POST /api/execute-task`);
      console.log(`   POST /api/mcp/tools/call`);
      console.log(`\n🤖 Servidor MCP HTTP funcionando correctamente`);
      console.log(`🌐 URL: http://localhost:${HTTP_PORT}`);
    });
    
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  // Cerrar todos los navegadores
  for (const browser of browserInstances.values()) {
    browser.close();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...');
  // Cerrar todos los navegadores
  for (const browser of browserInstances.values()) {
    browser.close();
  }
  process.exit(0);
});

// Iniciar el servidor
main(); 