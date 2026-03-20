const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT_HTTP = 3000;
const PORT_HTTPS = 3443;
const APP_DIR = path.join(__dirname, 'app');

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon'
};

function serve(req, res) {
  let url = req.url.split('?')[0];
  if (url === '/') url = '/index.html';

  const filePath = path.join(APP_DIR, url);
  const ext = path.extname(filePath);

  if (!filePath.startsWith(APP_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function generateSelfSignedCert() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048
  });

  const now = new Date();
  const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const cert = crypto.X509Certificate ? null : null;

  try {
    const { execSync } = require('child_process');
    const keyPath = path.join(__dirname, '_key.pem');
    const certPath = path.join(__dirname, '_cert.pem');

    const keyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
    fs.writeFileSync(keyPath, keyPem);

    execSync(
      `node -e "` +
      `const c=require('crypto');` +
      `const k=require('fs').readFileSync('${keyPath.replace(/\\/g, '\\\\')}');` +
      `const p=c.createPrivateKey(k);` +
      `"`,
      { stdio: 'pipe' }
    );

    fs.unlinkSync(keyPath);
  } catch(e) {}

  return null;
}

http.createServer(serve).listen(PORT_HTTP, '0.0.0.0', () => {
  const nets = require('os').networkInterfaces();
  let localIP = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIP = net.address;
        break;
      }
    }
  }

  console.log('');
  console.log('  MHS3 Guia - Servidor Local');
  console.log('  ──────────────────────────');
  console.log(`  Local:   http://localhost:${PORT_HTTP}`);
  console.log(`  Rede:    http://${localIP}:${PORT_HTTP}`);
  console.log('');
  console.log('  No celular Android:');
  console.log(`  1. Conecte na mesma Wi-Fi`);
  console.log(`  2. Abra Chrome: http://${localIP}:${PORT_HTTP}`);
  console.log(`  3. Toque nos 3 pontinhos > "Instalar aplicativo"`);
  console.log(`     ou "Adicionar a tela inicial"`);
  console.log('');
  console.log('  Pressione Ctrl+C para parar');
  console.log('');
});
