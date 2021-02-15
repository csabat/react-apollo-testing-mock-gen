const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { Source, parse } = require('graphql');
const { getImportPaths, configPath, filePathName, fileFolderPath, processPathName, fileName, mockFilePath } = require('./import-path-parser');
const { getSelectionSet, getFragmentDefinitions, resolveFragmentPath } = require('./operation-parser');

const { getOperationsWithReturnTypes, schemaJsonPath } = require('./type-resolver');

const config = require(configPath);

fs.readFile(filePathName, async (error, data) => {
  const source = new Source(data.toString());
  console.log(JSON.stringify(parse(source, { noLocation: true }), null, 4));
  const sourceJson = parse(source, { noLocation: true });
  const fragmentPaths = getImportPaths(data.toString(), processPathName, fileFolderPath);
  const fragments = { ...getFragmentDefinitions(sourceJson.definitions), ...resolveFragmentPath(fragmentPaths) };
  const requestObject = sourceJson.definitions.find((def) => def.kind === 'OperationDefinition');

  const returnData = getSelectionSet(requestObject.selectionSet, fragments);
  const operationName = requestObject.operation === 'query' ? 'Query' : 'Mutation';

  const returnWithTypeNames = getOperationsWithReturnTypes(operationName, returnData);
  const template = mockTemplate(`mock${fileName.replace('.gql', '')}`, {}, returnWithTypeNames, fileName);
  // console.log(JSON.stringify(getSelectionSet(requestObject.selectionSet, fragments), null, 2));
  if (!fs.existsSync(`${fileFolderPath}/mocks`)) {
    fs.mkdirSync(`${fileFolderPath}/mocks`);
  }

  fs.writeFile(mockFilePath, template, (error) => {
    if (error) {
      console.log(err)
    }

    console.log('File created successfully. 🎉')
  });

  fs.unlink(schemaJsonPath, (err) => {
    if (err) {
      console.error(err);
    }

    console.log('Cleaning up. 🧹')
  });

  if (config.lint) {
    exec(config.lint(mockFilePath), (err, stdout, stderr) => {
      if (err) {
        console.log(err);
  
        return;
      }

      console.log('File has been formatted successfully. 💅');
    });
  }
});

const mockTemplate = (name, variables, result, queryFileName) => `
const queryDocument = require('../${queryFileName}')

export const ${name} = () => [
  {
    request: {
      query: queryDocument,
      variables: ${JSON.stringify(variables, null, 2)}
    },
    result: {
      data: ${JSON.stringify(result, null, 2)}
    }
  }
];

`;
