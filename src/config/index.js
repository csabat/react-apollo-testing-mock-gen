const path = require('path');
const fs = require('fs');

const configPath = path.join(process.cwd(), 'mock-generator.config.js');

try {
  fs.readFileSync(configPath)
} catch (e) {
  console.log('❌  Could not find config. \n');
  console.log('🤞  Try to run "mock-gen --init".')
}

const config = require(configPath);

module.exports = config;
