# Bot MCP Server

Servidor MCP básico con funcionalidad de web scraping usando Playwright.

## Instalación

```bash
npm install
npx playwright install chromium
```

## Uso

```bash
node index.js
```

## Deploy en Render

1. Conecta tu repositorio a Render
2. Configura como servicio web con:
   - Build Command: `npm install`
   - Start Command: `npm start`
3. El browser se instalará automáticamente al iniciar

## Herramientas disponibles

- `scrape_webpage`: Scrapea contenido de una página web
  - Parámetros: `url` (string) 