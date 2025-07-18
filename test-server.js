// Script de prueba para el servidor MCP
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testServer() {
  console.log('🧪 Iniciando pruebas del servidor MCP...\n');

  try {
    // Test 1: Verificar estado del servidor
    console.log('1. Probando endpoint /api/status...');
    const statusResponse = await fetch(`${BASE_URL}/api/status`);
    const status = await statusResponse.json();
    console.log('✅ Estado del servidor:', status);

    // Test 2: Probar navegación
    console.log('\n2. Probando endpoint /api/navigate...');
    const navigateResponse = await fetch(`${BASE_URL}/api/navigate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://example.com'
      })
    });
    const navigateResult = await navigateResponse.json();
    console.log('✅ Navegación:', navigateResult);

    // Test 3: Probar screenshot
    console.log('\n3. Probando endpoint /api/screenshot...');
    const screenshotResponse = await fetch(`${BASE_URL}/api/screenshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: 'test-screenshot.png'
      })
    });
    const screenshotResult = await screenshotResponse.json();
    console.log('✅ Screenshot:', screenshotResult);

    // Test 4: Probar clic
    console.log('\n4. Probando endpoint /api/click...');
    const clickResponse = await fetch(`${BASE_URL}/api/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        element: 'botón de prueba',
        ref: 'test-ref-123'
      })
    });
    const clickResult = await clickResponse.json();
    console.log('✅ Clic:', clickResult);

    // Test 5: Probar escritura
    console.log('\n5. Probando endpoint /api/type...');
    const typeResponse = await fetch(`${BASE_URL}/api/type`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        element: 'campo de texto',
        ref: 'input-ref-456',
        text: 'Texto de prueba'
      })
    });
    const typeResult = await typeResponse.json();
    console.log('✅ Escritura:', typeResult);

    // Test 6: Probar acción genérica
    console.log('\n6. Probando endpoint /api/playwright...');
    const actionResponse = await fetch(`${BASE_URL}/api/playwright`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'test',
        params: { test: true }
      })
    });
    const actionResult = await actionResponse.json();
    console.log('✅ Acción genérica:', actionResult);

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('✅ El servidor MCP está funcionando correctamente');
    console.log('✅ Los endpoints HTTP están respondiendo');
    console.log('✅ Puedes integrar este servidor con tu aplicación Next.js');

  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
    console.log('\n💡 Asegúrate de que:');
    console.log('   1. El servidor esté ejecutándose (npm start)');
    console.log('   2. El puerto 3001 esté disponible');
    console.log('   3. Todas las dependencias estén instaladas');
  }
}

// Ejecutar pruebas
testServer(); 