const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { Source, parse } = require('graphql');
const { getImportPaths } = require('./import-path-parser');
const { getSelectionSet, getFragmentDefinitions, resolveFragmentPath } = require('./operation-parser');

const { getOperationsWithReturnTypes, schemaJsonPath } = require('./type-resolver');

const configPath = path.join(process.cwd(), 'mockGenerator.config.js');

// eslint-disable-next-line import/no-dynamic-require
const config = require(configPath);

const processPathName = process.cwd();
const filePathName = path.join(processPathName, process.argv[2]).split('/');
const filePathFolder = filePathName.slice(0, filePathName.length - 1).join('/');

fs.readFile(`${path.join(processPathName, process.argv[2])}`, async (error, data) => {
  const source = new Source(data.toString());
  const sourceJson = parse(source, { noLocation: true });
  const fragmentPaths = getImportPaths(data.toString(), processPathName, filePathFolder);
  const fragments = { ...getFragmentDefinitions(sourceJson.definitions), ...resolveFragmentPath(fragmentPaths) };
  const requestObject = sourceJson.definitions.find((def) => def.kind === 'OperationDefinition');

  const rootPath = filePathName.slice(0, filePathName.length - 1).join('/');
  const queryFileName = filePathName[filePathName.length - 1];
  const returnData = getSelectionSet(requestObject.selectionSet, fragments);

  const returnWithTypeNames = getOperationsWithReturnTypes('Query', returnData);
  const template = mockTemplate(`mock${queryFileName.replace('.gql', '')}`, {}, returnWithTypeNames, queryFileName);

  // console.log(JSON.stringify(getSelectionSet(requestObject.selectionSet, fragments), null, 2));
  if (!fs.existsSync(`${rootPath}/mocks`)) {
    fs.mkdirSync(`${rootPath}/mocks`);
  }

  const mockFilePath = `${rootPath}/mocks/${queryFileName.replace('.gql', `.mock${config.fileExtension}`)}`;

  fs.writeFile(mockFilePath, template, () => {});
  // console.log(JSON.stringify(parse(source, { noLocation: true }), null, 4));

  fs.unlink(schemaJsonPath, (err) => {
    if (err) {
      console.error(err);
    }
  });

  exec(config.lint(mockFilePath), (err, stdout, stderr) => {
    if (err) {
      console.log(err);

      return;
    }

    // the *entire* stdout and stderr (buffered)
    console.log(stdout);
    console.log(stderr);
  });
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
