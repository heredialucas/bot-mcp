import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { chromium } from 'playwright';
import { execSync } from 'child_process';

// Instalar browser si no existe
try {
  console.error('Instalando Playwright browsers...');
  execSync('npx playwright install chromium', { stdio: 'inherit' });
  console.error('Playwright browsers instalados correctamente');
} catch (error) {
  console.error('Error instalando browsers:', error.message);
}

const server = new Server(
  {
    name: 'bot-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool to scrape a webpage
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'scrape_webpage') {
    const { url } = args;
    
    try {
      const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });
      
      const title = await page.title();
      const content = await page.textContent('body');
      
      await browser.close();
      
      return {
        content: [
          {
            type: 'text',
            text: `Title: ${title}\n\nContent: ${content.substring(0, 1000)}...`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error scraping webpage: ${error.message}`
          }
        ]
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Tool definitions
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'scrape_webpage',
        description: 'Scrape content from a webpage',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to scrape'
            }
          },
          required: ['url']
        }
      }
    ]
  };
});

const transport = new StdioServerTransport();
await server.connect(transport); 