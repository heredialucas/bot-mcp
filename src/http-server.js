import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

// Cargar variables de entorno
dotenv.config();

// Configuración del servidor HTTP
const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Función para ejecutar comandos MCP
async function executeMCPCommand(toolName, args = {}) {
  return new Promise((resolve, reject) => {
    const mcpProcess = spawn('node', ['src/mcp-server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    mcpProcess.on('close', (code) => {
      if (code === 0) {
        try {
          // Buscar la respuesta JSON en el output
          const lines = output.split('\n');
          for (const line of lines) {
            if (line.trim().startsWith('{')) {
              const result = JSON.parse(line);
              resolve(result);
              return;
            }
          }
          resolve({ success: true, output });
        } catch (e) {
          resolve({ success: true, output });
        }
      } else {
        reject(new Error(`MCP process failed: ${errorOutput}`));
      }
    });

    // Enviar comando al proceso MCP
    const command = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    });

    mcpProcess.stdin.write(command + '\n');
    mcpProcess.stdin.end();
  });
}

// Endpoints HTTP

// GET - Estado del servidor
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    message: 'Servidor HTTP con MCP de Playwright funcionando correctamente',
    availableTools: [
      'mcp_Playwright_browser_navigate',
      'mcp_Playwright_browser_snapshot',
      'mcp_Playwright_browser_click',
      'mcp_Playwright_browser_type',
      'mcp_Playwright_browser_take_screenshot',
      'mcp_Playwright_browser_evaluate'
    ]
  });
});

// POST - Ejecutar herramienta MCP
app.post('/api/execute', async (req, res) => {
  try {
    const { tool, args } = req.body;
    
    if (!tool) {
      return res.status(400).json({
        success: false,
        error: 'Tool name is required'
      });
    }

    console.log(`Ejecutando herramienta MCP: ${tool}`);
    console.log('Argumentos:', args);

    const result = await executeMCPCommand(tool, args || {});
    
    res.json({
      success: true,
      tool,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error ejecutando herramienta MCP:', error);
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
        error: 'URL is required'
      });
    }

    const result = await executeMCPCommand('mcp_Playwright_browser_navigate', { url });
    
    res.json({
      success: true,
      action: 'navigate',
      url,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error navegando:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Obtener snapshot de la página
app.post('/api/snapshot', async (req, res) => {
  try {
    const result = await executeMCPCommand('mcp_Playwright_browser_snapshot', {});
    
    res.json({
      success: true,
      action: 'snapshot',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error obteniendo snapshot:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Hacer click
app.post('/api/click', async (req, res) => {
  try {
    const { element, ref } = req.body;
    
    if (!element || !ref) {
      return res.status(400).json({
        success: false,
        error: 'Element and ref are required'
      });
    }

    const result = await executeMCPCommand('mcp_Playwright_browser_click', { element, ref });
    
    res.json({
      success: true,
      action: 'click',
      element,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error haciendo click:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Escribir texto
app.post('/api/type', async (req, res) => {
  try {
    const { element, ref, text } = req.body;
    
    if (!element || !ref || !text) {
      return res.status(400).json({
        success: false,
        error: 'Element, ref and text are required'
      });
    }

    const result = await executeMCPCommand('mcp_Playwright_browser_type', { element, ref, text });
    
    res.json({
      success: true,
      action: 'type',
      element,
      text,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error escribiendo texto:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Tomar screenshot
app.post('/api/screenshot', async (req, res) => {
  try {
    const { filename } = req.body;
    
    const result = await executeMCPCommand('mcp_Playwright_browser_take_screenshot', { 
      filename: filename || `screenshot-${Date.now()}.png` 
    });
    
    res.json({
      success: true,
      action: 'screenshot',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error tomando screenshot:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Ejecutar JavaScript
app.post('/api/evaluate', async (req, res) => {
  try {
    const { function: jsFunction } = req.body;
    
    if (!jsFunction) {
      return res.status(400).json({
        success: false,
        error: 'JavaScript function is required'
      });
    }

    const result = await executeMCPCommand('mcp_Playwright_browser_evaluate', { function: jsFunction });
    
    res.json({
      success: true,
      action: 'evaluate',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error ejecutando JavaScript:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST - Ejecutar tarea específica (como el endpoint anterior)
app.post('/api/execute-task', async (req, res) => {
  try {
    const { url, task } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Primero navegar a la URL
    await executeMCPCommand('mcp_Playwright_browser_navigate', { url });

    let result = {};

    switch (task) {
      case 'get_title':
        const titleResult = await executeMCPCommand('mcp_Playwright_browser_evaluate', { 
          function: '() => document.title' 
        });
        result.title = titleResult.content[0].text;
        break;

      case 'get_meta':
        const metaResult = await executeMCPCommand('mcp_Playwright_browser_evaluate', { 
          function: `() => {
            const metas = document.querySelectorAll('meta');
            const metaData = {};
            metas.forEach(meta => {
              const name = meta.getAttribute('name') || meta.getAttribute('property');
              const content = meta.getAttribute('content');
              if (name && content) {
                metaData[name] = content;
              }
            });
            return metaData;
          }` 
        });
        result.meta = JSON.parse(metaResult.content[0].text);
        break;

      case 'get_headers':
        const headersResult = await executeMCPCommand('mcp_Playwright_browser_evaluate', { 
          function: `() => {
            const headers = [];
            for (let i = 1; i <= 6; i++) {
              const elements = document.querySelectorAll('h${i}');
              elements.forEach(el => {
                headers.push({
                  level: i,
                  text: el.textContent.trim()
                });
              });
            }
            return headers;
          }` 
        });
        result.headers = JSON.parse(headersResult.content[0].text);
        break;

      case 'get_links':
        const linksResult = await executeMCPCommand('mcp_Playwright_browser_evaluate', { 
          function: `() => {
            const links = [];
            document.querySelectorAll('a').forEach(link => {
              links.push({
                text: link.textContent.trim(),
                href: link.href,
                title: link.title
              });
            });
            return links;
          }` 
        });
        result.links = JSON.parse(linksResult.content[0].text);
        break;

      case 'get_images':
        const imagesResult = await executeMCPCommand('mcp_Playwright_browser_evaluate', { 
          function: `() => {
            const images = [];
            document.querySelectorAll('img').forEach(img => {
              images.push({
                src: img.src,
                alt: img.alt,
                title: img.title,
                width: img.width,
                height: img.height
              });
            });
            return images;
          }` 
        });
        result.images = JSON.parse(imagesResult.content[0].text);
        break;

      case 'get_forms':
        const formsResult = await executeMCPCommand('mcp_Playwright_browser_evaluate', { 
          function: `() => {
            const forms = [];
            document.querySelectorAll('form').forEach(form => {
              const formData = {
                action: form.action,
                method: form.method,
                inputs: []
              };
              form.querySelectorAll('input, textarea, select').forEach(input => {
                formData.inputs.push({
                  type: input.type || input.tagName.toLowerCase(),
                  name: input.name,
                  placeholder: input.placeholder,
                  value: input.value
                });
              });
              forms.push(formData);
            });
            return forms;
          }` 
        });
        result.forms = JSON.parse(formsResult.content[0].text);
        break;

      case 'get_text':
        const textResult = await executeMCPCommand('mcp_Playwright_browser_evaluate', { 
          function: '() => document.body.innerText.trim()' 
        });
        result.text = textResult.content[0].text;
        break;

      case 'get_all':
        // Obtener todo
        const allResults = await Promise.all([
          executeMCPCommand('mcp_Playwright_browser_evaluate', { function: '() => document.title' }),
          executeMCPCommand('mcp_Playwright_browser_evaluate', { 
            function: `() => {
              const metas = document.querySelectorAll('meta');
              const metaData = {};
              metas.forEach(meta => {
                const name = meta.getAttribute('name') || meta.getAttribute('property');
                const content = meta.getAttribute('content');
                if (name && content) {
                  metaData[name] = content;
                }
              });
              return metaData;
            }` 
          }),
          executeMCPCommand('mcp_Playwright_browser_evaluate', { 
            function: `() => {
              const headers = [];
              for (let i = 1; i <= 6; i++) {
                const elements = document.querySelectorAll('h${i}');
                elements.forEach(el => {
                  headers.push({
                    level: i,
                    text: el.textContent.trim()
                  });
                });
              }
              return headers;
            }` 
          }),
          executeMCPCommand('mcp_Playwright_browser_evaluate', { 
            function: `() => {
              const links = [];
              document.querySelectorAll('a').forEach(link => {
                links.push({
                  text: link.textContent.trim(),
                  href: link.href,
                  title: link.title
                });
              });
              return links;
            }` 
          }),
          executeMCPCommand('mcp_Playwright_browser_evaluate', { 
            function: `() => {
              const images = [];
              document.querySelectorAll('img').forEach(img => {
                images.push({
                  src: img.src,
                  alt: img.alt,
                  title: img.title,
                  width: img.width,
                  height: img.height
                });
              });
              return images;
            }` 
          }),
          executeMCPCommand('mcp_Playwright_browser_evaluate', { 
            function: `() => {
              const forms = [];
              document.querySelectorAll('form').forEach(form => {
                const formData = {
                  action: form.action,
                  method: form.method,
                  inputs: []
                };
                form.querySelectorAll('input, textarea, select').forEach(input => {
                  formData.inputs.push({
                    type: input.type || input.tagName.toLowerCase(),
                    name: input.name,
                    placeholder: input.placeholder,
                    value: input.value
                  });
                });
                forms.push(formData);
              });
              return forms;
            }` 
          }),
          executeMCPCommand('mcp_Playwright_browser_evaluate', { function: '() => document.body.innerText.trim()' })
        ]);

        result = {
          title: allResults[0].content[0].text,
          meta: JSON.parse(allResults[1].content[0].text),
          headers: JSON.parse(allResults[2].content[0].text),
          links: JSON.parse(allResults[3].content[0].text),
          images: JSON.parse(allResults[4].content[0].text),
          forms: JSON.parse(allResults[5].content[0].text),
          text: allResults[6].content[0].text
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Task not recognized. Available tasks: get_title, get_meta, get_headers, get_links, get_images, get_forms, get_text, get_all'
        });
    }

    res.json({
      success: true,
      url,
      task,
      result,
      timestamp: new Date().toISOString()
    });

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
    // Iniciar servidor HTTP
    app.listen(HTTP_PORT, () => {
      console.log(`🚀 Servidor HTTP con MCP iniciado en puerto ${HTTP_PORT}`);
      console.log(`📡 Endpoints disponibles:`);
      console.log(`   GET  /api/status`);
      console.log(`   POST /api/execute`);
      console.log(`   POST /api/navigate`);
      console.log(`   POST /api/snapshot`);
      console.log(`   POST /api/click`);
      console.log(`   POST /api/type`);
      console.log(`   POST /api/screenshot`);
      console.log(`   POST /api/evaluate`);
      console.log(`   POST /api/execute-task`);
      console.log(`\n🤖 Servidor HTTP con MCP funcionando correctamente`);
      console.log(`🌐 URL: http://localhost:${HTTP_PORT}`);
      console.log(`🔌 Usando servidor MCP interno: src/mcp-server.js`);
    });
    
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor HTTP...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor HTTP...');
  process.exit(0);
});

// Iniciar el servidor
main(); 