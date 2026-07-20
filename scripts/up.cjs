const http = require('http');
const fs = require('fs');
const path = require('path');

let cookie = '';
const BASE = 'http://localhost:3000';

function req(method, url, opts) {
  return new Promise((resolve, reject) => {
    const u = new URL(url, BASE);
    const o = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: method,
      headers: {},
    };
    if (cookie) o.headers['Cookie'] = cookie;

    let body;
    if (opts && opts.form) {
      const boundary = '----' + Math.random().toString(36).slice(2);
      const parts = [];
      for (const [k, v] of Object.entries(opts.form)) {
        parts.push('--' + boundary);
        parts.push('Content-Disposition: form-data; name="' + k + '"');
        if (v.filename) {
          parts[parts.length - 1] += '; filename="' + v.filename + '"';
          parts.push('Content-Type: ' + (v.contentType || 'application/octet-stream'));
          parts.push('');
          parts.push(typeof v.content === 'string' ? v.content : v.content.toString());
        } else {
          parts.push('');
          parts.push(String(v));
        }
      }
      parts.push('--' + boundary + '--');
      body = parts.join('\r\n');
      o.headers['Content-Type'] = 'multipart/form-data; boundary=' + boundary;
      o.headers['Content-Length'] = Buffer.byteLength(body);
    } else if (opts && opts.json) {
      body = JSON.stringify(opts.json);
      o.headers['Content-Type'] = 'application/json';
      o.headers['Content-Length'] = Buffer.byteLength(body);
    } else if (opts && opts.formData) {
      body = new URLSearchParams(opts.formData).toString();
      o.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      o.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const r = http.request(o, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.headers['set-cookie']) {
          const newCookies = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
          if (newCookies) cookie = newCookies;
        }
        resolve({ status: res.statusCode, body: data, headers: res.headers });
      });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function main() {
  console.log('1. CSRF');
  const c1 = await req('GET', '/api/auth/csrf');
  const csrf = JSON.parse(c1.body).csrfToken;

  console.log('2. Login');
  const l = await req('POST', '/api/auth/callback/credentials', {
    formData: {
      email: 'nirut.rodngam1978@gmail.com',
      password: 'password123',
      csrfToken: csrf,
      callbackUrl: BASE + '/admin',
      json: 'true',
    }
  });
  console.log('Login status:', l.status, l.body.slice(0, 50));

  const s = await req('GET', '/api/auth/session');
  const sess = JSON.parse(s.body);
  console.log('Session user:', sess.user ? sess.user.email : 'NONE');

  if (!sess.user) {
    console.log('Login failed!');
    process.exit(1);
  }

  console.log('3. Upload logo');
  const svgPath = '/mnt/c/NIRUT-Storage/PROJECT-AI/Neno-Jewelry/jewelry-store/public/logo.svg';
  const svgContent = fs.readFileSync(svgPath);
  const u = await req('POST', '/api/upload/settings-logo', {
    form: {
      file: { filename: 'logo.svg', content: svgContent, contentType: 'image/svg+xml' },
    }
  });
  const url = JSON.parse(u.body).url;
  if (!url) { console.log('Upload failed:', u.body); process.exit(1); }
  console.log('Logo URL:', url);

  console.log('4. Update settings');
  const s2 = await req('PUT', '/api/settings', {
    json: { logoUrl: url },
  });
  const settings = JSON.parse(s2.body);
  console.log('Settings logoUrl:', settings.logoUrl);
  console.log('DONE');
}

main().catch(e => { console.error(e.message); process.exit(1); });
