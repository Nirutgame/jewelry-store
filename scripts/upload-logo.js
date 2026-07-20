const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000';
const JAR = '/tmp/cookie.txt';

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(BASE + url, { headers: { Cookie: fs.readFileSync(JAR, 'utf8').trim() || '' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const cookies = res.headers['set-cookie'] || [];
        cookies.forEach(c => {
          const val = c.split(';')[0];
          if (!fs.readFileSync(JAR, 'utf8').includes(val.split('=')[0])) {
            fs.appendFileSync(JAR, val + '\n');
          }
        });
        resolve(data);
      });
    });
  });
}

function post(url, body, contentType) {
  return new Promise((resolve, reject) => {
    const b = typeof body === 'string' ? body : '';
    const req = http.request(BASE + url, {
      method: 'POST',
      headers: {
        'Content-Type': contentType || 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(b),
        Cookie: fs.readFileSync(JAR, 'utf8').trim() || '',
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const cookies = res.headers['set-cookie'] || [];
        cookies.forEach(c => {
          const val = c.split(';')[0];
          if (!fs.readFileSync(JAR, 'utf8').includes(val.split('=')[0])) {
            fs.appendFileSync(JAR, val + '\n');
          }
        });
        resolve(data);
      });
    });
    req.write(b);
    req.end();
  });
}

function postForm(url, boundary, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(BASE + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': Buffer.byteLength(body),
        Cookie: fs.readFileSync(JAR, 'utf8').trim() || '',
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.write(body);
    req.end();
  });
}

function put(url, body) {
  return new Promise((resolve, reject) => {
    const b = JSON.stringify(body);
    const req = http.request(BASE + url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(b),
        Cookie: fs.readFileSync(JAR, 'utf8').trim() || '',
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.write(b);
    req.end();
  });
}

async function main() {
  // Init cookie file
  fs.writeFileSync(JAR, '');

  // Step 1: Login
  const csrfResp = JSON.parse(await get('/api/auth/csrf'));
  console.log('CSRF:', csrfResp.csrfToken.slice(0, 20));
  
  const loginResp = JSON.parse(await post(
    '/api/auth/callback/credentials',
    `email=nirut.rodngam1978@gmail.com&password=Neno2024!&csrfToken=${csrfResp.csrfToken}&callbackUrl=http://localhost:3000/admin&json=true`
  ));
  console.log('Login:', JSON.stringify(loginResp));

  const session = JSON.parse(await get('/api/auth/session'));
  console.log('Session user:', session.user?.email);

  // Step 2: Read SVG file
  const svgPath = path.join(__dirname, '..', 'public', 'logo.svg');
  const svgContent = fs.readFileSync(svgPath);
  console.log('SVG size:', svgContent.length, 'bytes');

  // Step 3: Upload logo
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
  const body = 
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="logo.svg"\r\n` +
    `Content-Type: image/svg+xml\r\n\r\n` +
    svgContent.toString() +
    `\r\n--${boundary}--\r\n`;

  const uploadResp = JSON.parse(await postForm('/api/upload/settings-logo', boundary, body));
  console.log('Upload:', JSON.stringify(uploadResp));

  if (!uploadResp.url) {
    console.error('Upload failed');
    process.exit(1);
  }

  // Step 4: Update settings with logo URL
  const settingsResp = JSON.parse(await put('/api/settings', { logoUrl: uploadResp.url }));
  console.log('Settings updated:', settingsResp.logoUrl);
  console.log('DONE - Logo:', uploadResp.url);
}

main().catch(console.error);
