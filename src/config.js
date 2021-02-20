const path = require('path');

const configPath = path.join(process.cwd(), 'mockGenerator.config.js');

const config = require(configPath);

module.exports = config;
