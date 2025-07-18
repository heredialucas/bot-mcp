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

// Función para ejecutar comandos MCP de Playwright
async function executeMCPCommand(toolName, args = {}) {
  return new Promise((resolve, reject) => {
    const mcpProcess = spawn('npx', ['-y', '@executeautomation/playwright-mcp-server'], {
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
          const result = JSON.parse(output);
          resolve(result);
        } catch (e) {
          resolve({ success: true, output });
        }
      } else {
        reject(new Error(`MCP process failed: ${errorOutput}`));
      }
    });

    // Enviar comando al proceso MCP
    const command = JSON.stringify({
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
    message: 'Servidor MCP Proxy funcionando correctamente',
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

// POST - Ejecutar herramienta MCP de Playwright
app.post('/api/mcp/execute', async (req, res) => {
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

// Función principal
async function main() {
  try {
    // Iniciar servidor HTTP
    app.listen(HTTP_PORT, () => {
      console.log(`🚀 Servidor MCP Proxy iniciado en puerto ${HTTP_PORT}`);
      console.log(`📡 Endpoints disponibles:`);
      console.log(`   GET  /api/status`);
      console.log(`   POST /api/mcp/execute`);
      console.log(`   POST /api/navigate`);
      console.log(`   POST /api/screenshot`);
      console.log(`   POST /api/click`);
      console.log(`   POST /api/type`);
      console.log(`   POST /api/snapshot`);
      console.log(`   POST /api/evaluate`);
      console.log(`\n🤖 Servidor MCP Proxy funcionando correctamente`);
      console.log(`🌐 URL: http://localhost:${HTTP_PORT}`);
      console.log(`🔌 Usando servidor MCP de Playwright: @executeautomation/playwright-mcp-server`);
    });
    
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor MCP Proxy...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor MCP Proxy...');
  process.exit(0);
});

// Iniciar el servidor
main(); 