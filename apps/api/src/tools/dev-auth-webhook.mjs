import http from 'node:http';

const PORT = Number(process.env.AUTH_EMAIL_WEBHOOK_DEV_PORT ?? 4100);
const TOKEN = process.env.AUTH_EMAIL_WEBHOOK_TOKEN;

if (!TOKEN) {
  throw new Error('AUTH_EMAIL_WEBHOOK_TOKEN is required.');
}

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/email') {
    res.writeHead(404);
    res.end();
    return;
  }

  if (req.headers.authorization !== `Bearer ${TOKEN}`) {
    res.writeHead(401);
    res.end('Unauthorized');
    return;
  }

  let raw = '';

  req.on('data', (chunk) => {
    raw += chunk;
  });

  req.on('end', () => {
    try {
      const body = JSON.parse(raw);

      if (body.type === 'authentication_code') {
        console.log('\n========================================');
        console.log('WAAND DEVELOPMENT AUTH EMAIL');
        console.log('========================================');
        console.log(`To:      ${body.destination}`);
        console.log(`Code:    ${body.code}`);
        console.log(`Expires: ${body.expiresInSeconds}s`);
        console.log('========================================\n');
      } else if (body.type === 'security_notification') {
        console.log('\n========================================');
        console.log('WAAND SECURITY NOTIFICATION');
        console.log('========================================');
        console.log(`To:    ${body.destination}`);
        console.log(`Event: ${body.event}`);
        console.log('========================================\n');
      }

      res.writeHead(204);
      res.end();
    } catch {
      res.writeHead(400);
      res.end('Invalid JSON');
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Waand development email webhook listening at http://127.0.0.1:${PORT}/email`);
});
