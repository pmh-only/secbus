const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const HOST = 'samsung.u-vis.com';
const UA = 'Mozilla/5.0 (Linux; Android 10) secbus-viewer';
let cookieJar = '';
let loggedIn = false;

function upstream(pathAndQuery) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      host: HOST,
      path: pathAndQuery,
      method: 'GET',
      headers: {
        'User-Agent': UA,
        'Accept': '*/*',
        ...(cookieJar ? { Cookie: cookieJar } : {}),
      },
    }, (res) => {
      const setCookies = res.headers['set-cookie'];
      if (setCookies) {
        const jar = {};
        cookieJar.split(';').map(s => s.trim()).filter(Boolean).forEach(c => {
          const i = c.indexOf('='); if (i > 0) jar[c.slice(0, i)] = c.slice(i + 1);
        });
        setCookies.forEach(sc => {
          const pair = sc.split(';')[0];
          const i = pair.indexOf('='); if (i > 0) jar[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
        });
        cookieJar = Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function ensureLogin() {
  if (loggedIn) return;
  const uid = 'e4ab4f06-e053-42f0-a062-acd8410d53fb';
  const q = `/mobile/LoginAction.do?method=loginProcJson&USER_ID=${uid}&N_PASSWD=${uid}&logintype=NORMAL&GUEST_YN=Y&CUST_ID=CI130708000013&DEVICE_HP_NUMBER=&DEVICE_TYPE=A&DEVICE_ID=${uid}&USER_SEQ=&REGISTRATIONID_TOKEN=&APP_ID=kr.co.s1.uvisgen.gcm`;
  const r = await upstream(q);
  try {
    const j = JSON.parse(r.body);
    if (j.SYS_RETN_CODE === '01' || j.SYS_RETURN_CODE === '01') loggedIn = true;
  } catch {}
}

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://localhost');
    if (u.pathname === '/api/sites') {
      const r = await upstream('/mobile/LoginAction.do?method=combolist&SELECT_FLAG=PUBLIC_CUSTOMER');
      res.writeHead(r.status, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(r.body);
    }
    if (u.pathname === '/api/routes') {
      await ensureLogin();
      const cust = u.searchParams.get('cust') || 'CI130708000011';
      const rm = u.searchParams.get('rm') || '1';
      const q = `/mobile/RouteAction.do?method=RouteSearch&CUST_ID=${cust}&SEARCH_TEXT=&START_TIME=&END_TIME=&RT_DAY_CODE=123001&SEARCH_TYPE=05&CURPAGE=1&POSTNUM=10000&RM_FLAG=${rm}&Latitude=&Longitude=&Distance=`;
      const r = await upstream(q);
      res.writeHead(r.status, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(r.body);
    }
    if (u.pathname === '/api/stations') {
      await ensureLogin();
      const rmIdx = u.searchParams.get('rm_idx');
      const r = await upstream(`/mobile/RouteAction.do?method=RouteList&RM_IDX=${encodeURIComponent(rmIdx)}`);
      res.writeHead(r.status, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(r.body);
    }
    if (u.pathname === '/api/buses') {
      await ensureLogin();
      const rmIdx = u.searchParams.get('rm_idx');
      const r = await upstream(`/mobile/RouteAction.do?method=RouteCarLocation&RM_IDX=${encodeURIComponent(rmIdx)}`);
      res.writeHead(r.status, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(r.body);
    }
    let filePath = u.pathname === '/' ? '/index.html' : u.pathname;
    const full = path.join(__dirname, 'public', filePath);
    if (!full.startsWith(path.join(__dirname, 'public'))) { res.writeHead(403); return res.end(); }
    fs.readFile(full, (err, data) => {
      if (err) { res.writeHead(404); return res.end('not found'); }
      const ext = path.extname(full);
      const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime + '; charset=utf-8' });
      res.end(data);
    });
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(String(e));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
