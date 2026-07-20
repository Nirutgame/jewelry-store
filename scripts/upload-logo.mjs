import { readFileSync } from 'fs';
import http from 'http';
import https from 'https';

const BASE = 'http://localhost:3000';

async function req(method, path, opts = {}) {
  const url = new URL(path, BASE);
  const headers = { Cookie: opts.cookie || '' };
  let body;

  if (opts.form) {
    // multipart form
    const boundary = '----' + Math.random().toString(36).slice(2);
    const parts = [];
    for (const [k, v] of Object.entries(opts.form)) {
      parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"`);
      if (v.filename) {
        parts[parts.length - 1] += `; filename="${v.filename}"`;
        parts.push(`Content-Type: ${v.contentType || 'application/octet-stream'}\r\n`);
        parts.push(v.content);
      } else {
        parts.push(`\r\n${v}`);
      }
    }
    parts.push(`--${boundary}--`);
    body = parts.join('\r\n');
    headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
    headers['Content-Length'] = Buffer.byteLength(body);
  } else if (opts.json) {
    body = JSON.stringify(opts.json);
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = Buffer.byteLength(body);
  } else if (opts.urlencoded) {
    body = new URLSearchParams(opts.urlencoded).toString();
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    headers['Content-Length'] = Buffer.byteLength(body);
  }

  return new Promise((resolve, reject) => {
    const h = new URL(url);
    const lib = h.protocol === 'https:' ? https : http;
    const options = {
      hostname: h.hostname, port: h.port, path: h.pathname + h.search,
      method, headers,
    };
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const sc = res.headers['set-cookie'] || [];
        resolve({ status: res.statusCode, body: data, cookie: sc.length ? sc : null });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  let cookie = '';

  // 1. CSRF
  const csrfRes = await req('GET', '/api/auth/csrf');
  const csrf = JSON.parse(csrfRes.body).csrfToken;
  console.log('CSRF OK');

  // 2. Login
  const loginRes = await req('POST', '/api/auth/callback/credentials', {
    urlencoded: {
      email: 'nirut.rodngam1978@gmail.com',
      password: 'Neno2024!',
      csrfToken: csrf,
      callbackUrl: 'http://localhost:3000/admin',
      json: 'true',
    }
  });
  console.log('Login status:', loginRes.status);

  if (loginRes.cookie) {
    cookie = loginRes.cookie.join('; ');
  }

  // 3. Check session
  const sessRes = await req('GET', '/api/auth/session', { cookie });
  const sess = JSON.parse(sessRes.body);
  console.log('Logged in as:', sess.user?.email || 'FAIL');

  // 4. Upload logo
  const svgPath = process.argv[2] || './public/logo.svg';
  const svgContent = readFileSync(svgPath);
  const filename = svgPath.split('/').pop() || 'logo.svg';

  const uploadRes = await req('POST', '/api/upload/settings-logo', {
    cookie,
    form: {
      file: { filename, content: svgContent, contentType: 'image/svg+xml' },
    }
  });
  const uploadJson = JSON.parse(uploadRes.body);
  console.log('Upload status:', uploadRes.status);
  console.log('Upload URL:', uploadJson.url);

  if (!uploadJson.url) {
    console.error('Upload failed:', uploadRes.body);
    process.exit(1);
  }

  // 5. Update settings
  const settingsRes = await req('PUT', '/api/settings', {
    cookie,
    json: { logoUrl: uploadJson.url },
  });
  const settingsJson = JSON.parse(settingsRes.body);
  console.log('Settings updated:', settingsJson.logoUrl);
  console.log('\n=== DONE === Logo:', uploadJson.url);
}

main().catch(console.error);
