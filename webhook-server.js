const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');

const SECRET = process.env.WEBHOOK_SECRET || 'your-secret-token-here';
const PORT = 9000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/deploy') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      // Verify signature
      const signature = req.headers['x-hub-signature-256'];
      const hash = 'sha256=' + crypto.createHmac('sha256', SECRET).update(body).digest('hex');
      
      if (signature === hash) {
        console.log('Deploy triggered at', new Date().toISOString());
        exec('/var/www/vibestudy/deploy.sh', (err, stdout, stderr) => {
          if (err) console.error('Deploy error:', err);
          else console.log('Deploy success');
        });
        res.writeHead(200);
        res.end('Deploy started');
      } else {
        console.log('Invalid signature');
        res.writeHead(401);
        res.end('Unauthorized');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
