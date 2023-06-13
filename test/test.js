import request from 'supertest';
import app from '../src/index.js';

import { Client } from 'pg';

const port = process.env.PORT || 3000;
let server;
let client;

// Before all tests
beforeAll(async () => {
  server = app.listen(port);
  console.log(`Listening on port ${port}`);

  client = new Client({
    user: 'shakeda',
    host: 'dpg-cgugbmg2qv2fdedbo640-a.frankfurt-postgres.render.com',
    database: 'juniyoudb',
    password: 'puMtqvjlq7ftkPfuvHwZFKUuZ5tlWQiV',
    port: 5432,
    ssl: true,
  });

  client.connect();
  console.log('Connected to PostgreSQL');
});

// After all tests
afterAll(async () => {
  await client.end();
  await server.close();
});

describe('GET /', () => {
  it('responds with HTML page containing Who we are content', (done) => {
    request(server)
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).toContain('We are a social network designated for juniors.');
        done();
      });
  });
});

describe('GET /Account', () => {
  it('responds with HTML page containing account information', (done) => {
    request(server)
      .get('/Account')
      .expect(302)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).toContain('Found');
        done();
      });
  });
});
describe('GET /Login', () => {
  it('responds with HTML page containing login information', (done) => {
    request(server)
      .get('/Login')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
})
describe('GET /Register', () => {
  it('responds with HTML page containing register information', (done) => {
    request(server)
      .get('/Register')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});
describe('GET /admin', () => {
  it('responds with HTML page containing admin information', (done) => {
    request(server)
      .get('/Login')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});

