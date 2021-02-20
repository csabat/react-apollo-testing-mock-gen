const fs = require('fs');

const config = require('./config');

const { exec } = require('child_process');
const { mockTemplate } = require('./template');
const { getFileSource } = require('./gql-file-parser');
const { capitalize } = require('./utils');
const { buildFragmentStuctures } = require('./fragment-parser');
const { filePathName, fileFolderPath, fileName, mockFilePath } = require('./import-path-parser');
const { buildSelectionStructure } = require('./query-builder');
const { getVariables, getOperationDefinition } = require('./operation-parser');
const { resolveSelectionValues } = require('./type-resolver');

const generateMock = () => {
  const { sourceJson, content } = getFileSource(filePathName);
  const fragments = buildFragmentStuctures(content, sourceJson);
  const operationDefinition = getOperationDefinition(sourceJson);

  const variables = getVariables(operationDefinition.variableDefinitions);

  const requestObjectStructure = buildSelectionStructure(operationDefinition.selectionSet, fragments);
  const operationName = capitalize(operationDefinition.operation)
  const mockResponse = resolveSelectionValues(operationName, requestObjectStructure);
  const template = mockTemplate(fileName.replace('.gql', ''), variables, mockResponse, fileName);

  if (!fs.existsSync(`${fileFolderPath}/mocks`)) {
    try {
      fs.mkdirSync(`${fileFolderPath}/mocks`);
    } catch (e) {
      console.log('❌  Could not create mock folder.');
    }
  }

  fs.writeFile(mockFilePath, template, (error) => {
    if (error) {
      console.log('❌  Could not create mock file.');

      process.exit(1);
    }

    console.log('File created successfully. 🎉')
  });

  if (config.lint) {
    exec(config.lint(mockFilePath), (err) => {
      if (err) {
        console.log('❌  Could not execute lint command.');
        
        process.exit(1);
      }

      console.log('File has been formatted successfully. 💅');
    });
  }
}

module.exports = {
  generateMock
}