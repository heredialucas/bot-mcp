// Ejemplo de integración con Next.js
// Este archivo muestra cómo usar el servidor MCP desde tu aplicación Next.js

// Clase para manejar la comunicación con el servidor MCP
class MCPClient {
  constructor(baseURL = 'http://localhost:3001') {
    this.baseURL = baseURL;
  }

  // Verificar estado del servidor
  async getStatus() {
    const response = await fetch(`${this.baseURL}/api/status`);
    return await response.json();
  }

  // Navegar a una URL
  async navigate(url) {
    const response = await fetch(`${this.baseURL}/api/navigate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });
    return await response.json();
  }

  // Tomar screenshot
  async takeScreenshot(options = {}) {
    const response = await fetch(`${this.baseURL}/api/screenshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options)
    });
    return await response.json();
  }

  // Hacer clic en un elemento
  async click(element, ref, options = {}) {
    const response = await fetch(`${this.baseURL}/api/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        element,
        ref,
        ...options
      })
    });
    return await response.json();
  }

  // Escribir texto
  async type(element, ref, text, options = {}) {
    const response = await fetch(`${this.baseURL}/api/type`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        element,
        ref,
        text,
        ...options
      })
    });
    return await response.json();
  }

  // Ejecutar acción genérica
  async executeAction(action, params) {
    const response = await fetch(`${this.baseURL}/api/playwright`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, params })
    });
    return await response.json();
  }
}

// Ejemplo de uso en Next.js API Route
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const mcpClient = new MCPClient();
  
  try {
    const { action, ...params } = req.body;

    switch (action) {
      case 'navigate':
        const navigateResult = await mcpClient.navigate(params.url);
        return res.json(navigateResult);

      case 'screenshot':
        const screenshotResult = await mcpClient.takeScreenshot(params);
        return res.json(screenshotResult);

      case 'click':
        const clickResult = await mcpClient.click(params.element, params.ref, params);
        return res.json(clickResult);

      case 'type':
        const typeResult = await mcpClient.type(params.element, params.ref, params.text, params);
        return res.json(typeResult);

      case 'status':
        const statusResult = await mcpClient.getStatus();
        return res.json(statusResult);

      default:
        return res.status(400).json({ error: 'Action not supported' });
    }
  } catch (error) {
    console.error('Error in MCP API route:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Ejemplo de uso en componente React
export function useMCP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeAction = async (action, params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...params })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error executing action');
      }

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    executeAction,
    loading,
    error
  };
}

// Ejemplo de componente React
export function MCPControl() {
  const { executeAction, loading, error } = useMCP();
  const [url, setUrl] = useState('');

  const handleNavigate = async () => {
    try {
      const result = await executeAction('navigate', { url });
      console.log('Navegación exitosa:', result);
    } catch (err) {
      console.error('Error en navegación:', err);
    }
  };

  const handleScreenshot = async () => {
    try {
      const result = await executeAction('screenshot', {
        filename: `screenshot-${Date.now()}.png`
      });
      console.log('Screenshot tomado:', result);
    } catch (err) {
      console.error('Error tomando screenshot:', err);
    }
  };

  return (
    <div className="mcp-control">
      <h2>Control MCP</h2>
      
      {error && <div className="error">{error}</div>}
      
      <div className="control-group">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
        />
        <button 
          onClick={handleNavigate}
          disabled={loading || !url}
        >
          {loading ? 'Navegando...' : 'Navegar'}
        </button>
      </div>

      <div className="control-group">
        <button 
          onClick={handleScreenshot}
          disabled={loading}
        >
          {loading ? 'Capturando...' : 'Tomar Screenshot'}
        </button>
      </div>
    </div>
  );
}

// Ejemplo de configuración en next.config.js
export const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/mcp/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

// Ejemplo de uso directo sin API Route
export async function directMCPCall() {
  const mcpClient = new MCPClient();
  
  try {
    // Verificar estado
    const status = await mcpClient.getStatus();
    console.log('Estado del servidor:', status);

    // Navegar a una página
    const navigateResult = await mcpClient.navigate('https://example.com');
    console.log('Navegación:', navigateResult);

    // Tomar screenshot
    const screenshotResult = await mcpClient.takeScreenshot({
      filename: 'example-screenshot.png'
    });
    console.log('Screenshot:', screenshotResult);

  } catch (error) {
    console.error('Error en llamada MCP:', error);
  }
} 