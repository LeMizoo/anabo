const { createServer } = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // Derrière Apache/Passenger, la requête arrive en http en interne
    req.headers['x-forwarded-proto'] = 'https';
    if (!req.headers['x-forwarded-host']) {
      req.headers['x-forwarded-host'] = req.headers.host;
    }
    handle(req, res);
  });

  if (typeof PhusionPassenger !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
    server.listen('passenger');
  } else {
    server.listen(process.env.PORT || 3000);
  }
});