const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const script = fs.readFileSync(path.join(__dirname, '../scripts/submit-indexnow.cjs'), 'utf8');

async function runSubmission(environment) {
  const requests = [];
  const logs = [];
  let fileReads = 0;
  vm.runInNewContext(script, {
    __dirname: path.join(__dirname, '../scripts'),
    process: { env: environment === undefined ? {} : { VERCEL_ENV: environment } },
    require(name) {
      if (name === 'path') return path;
      if (name === 'fs') return {
        existsSync: () => true,
        readFileSync: () => {
          fileReads += 1;
          return '<urlset><url><loc>https://luxemia.shop/product/live-product</loc></url></urlset>';
        },
      };
      throw new Error(`Unexpected require: ${name}`);
    },
    fetch: async (url, options) => {
      requests.push({ url, options });
      return { status: 202 };
    },
    console: { log: (message) => logs.push(message), warn: (message) => logs.push(message) },
  });
  await new Promise(setImmediate);
  return { requests, logs, fileReads };
}

for (const environment of ['preview', 'development']) {
  test(`${environment} builds do not read production sitemaps or submit IndexNow requests`, async () => {
    const result = await runSubmission(environment);
    assert.equal(result.fileReads, 0);
    assert.equal(result.requests.length, 0);
    assert.match(result.logs.join('\n'), new RegExp(`Skipped for ${environment}`));
  });
}

for (const environment of ['production', undefined]) {
  test(`${environment || 'existing non-Vercel'} builds preserve canonical IndexNow submission`, async () => {
    const result = await runSubmission(environment);
    assert.equal(result.fileReads, 4);
    assert.equal(result.requests.length, 1);
    const { url, options } = result.requests[0];
    assert.equal(url, 'https://api.indexnow.org/indexnow');
    assert.equal(options.method, 'POST');
    const body = JSON.parse(options.body);
    assert.equal(body.host, 'luxemia.shop');
    assert.deepEqual(body.urlList, ['https://luxemia.shop/product/live-product']);
    assert.match(body.keyLocation, /^https:\/\/luxemia\.shop\/[a-z0-9]+\.txt$/);
    assert.match(result.logs.join('\n'), /Accepted 1 canonical URLs \(HTTP 202\)/);
  });
}
