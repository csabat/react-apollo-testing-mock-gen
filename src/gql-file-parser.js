const { Source, parse } = require('graphql');
const fs = require('fs');

const getFileSource = (filePath) => { 
  try {
    const fileContent = fs.readFileSync(filePath);
    const content = fileContent.toString();

    return {
      sourceJson: parse(new Source(content.toString()), { noLocation: true }),
      content
    };
  } catch (e) {
    console.log('❌  Invalid pathname provided.');
    process.exit(1)
  }
};

module.exports = {
  getFileSource
}