const fs = require('fs');
const path = require('path');

function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const specPath = path.join(process.cwd(), 'walmart-spec.json');
    const spec = fs.readFileSync(specPath, 'utf8');
    res.status(200).end(spec);
  } catch (err) {
    res.status(404).json({ error: 'Spec not found', message: err.message });
  }
}

module.exports = { default: handler };
