const express = require('express');
const https = require('https');
const app = express();
// Use a non-privileged port to avoid sudo and conflicts
const port = 3009;
const cors = require('cors');

// Enable CORS for all routes
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'HEAD', 'OPTIONS'],
    allowedHeaders: '*',
  })
);

// Handle preflight OPTIONS requests
app.options('*', cors());

// Serve static files with CORS headers
app.use(
  '/dist',
  express.static('dist', {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
    },
  })
);

// Generate self-signed certificate and start HTTPS server
const selfsigned = require('selfsigned');
const attrs = [{ name: 'commonName', value: 'localhost' }];
// Use a modern self-signed cert that browsers accept for dev
const pems = selfsigned.generate(attrs, {
  days: 365,
  keySize: 2048,
  algorithm: 'sha256',
});

https
  .createServer(
    {
      key: pems.private,
      cert: pems.cert,
      minVersion: 'TLSv1.2', // allow modern TLS; use defaults for ciphers
    },
    app
  )
  .listen(port, () => {
    console.log(`HTTPS server listening on https://localhost:${port}`);
    console.log(
      `Access bundle.js at: https://localhost:${port}/dist/bundle.js`
    );
    console.log(
      '\n⚠️  First time: visit the URL in your browser and accept the self-signed certificate'
    );
  });
