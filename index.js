
const arg = require('arg');
const init = require('./src/init');

const args = arg(
  {
  '--init':    Boolean,
  },
  {
    argv: process.argv.slice(2)
  }
);

const initialize = args['--init'] || false;

if (initialize) {
  init();
} else {
  const generateMock = require('./src');
  
  generateMock();
}
