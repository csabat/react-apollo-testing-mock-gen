const path = require('path');
const config = require('../config');

const aliasPaths = config.aliasPaths;

function getImportPaths(fileContent, dirname, parseFilePath) {
  if (fileContent.search('#import') !== -1) {
    const importPathsArray = fileContent.split('#import ');
    const importPaths = importPathsArray.map((importPath) => {
      // remove line break
      const reducedPath = importPath.split('\n')[0];
      const stringNotation = reducedPath[0];

      // remove string notation
      return reducedPath.split(stringNotation)[1];
    });

    const filePaths = importPaths.filter((importPath) => !!importPath);

    const aliasPathsNames = aliasPaths ? Object.keys(aliasPaths) : [];

    return filePaths.map((filePath) => {
      const alias = aliasPathsNames.find((aliasName) => filePath.search(aliasName) !== -1);
      const { rootPath, folder } = alias
        ? { rootPath: dirname, folder: filePath.replace(alias, aliasPaths[alias]) }
        : { rootPath: parseFilePath, folder: filePath };

      return path.join(rootPath, folder);
    });
  }

  return [];
}

const processPathName = process.cwd();
const filePathName = path.join(processPathName, process.argv[2]);
const filePathArray = filePathName.split('/');
const fileFolderPath = filePathArray.slice(0, filePathArray.length - 1).join('/');
const fileName = filePathArray[filePathArray.length - 1];
const mockFilePath = `${fileFolderPath}/mocks/${fileName.replace('.gql', `.mock${config.fileExtension}`)}`;
const schemaPath = path.join(processPathName, config.schemaPath);

module.exports = {
  getImportPaths,
  filePathName,
  fileFolderPath,
  processPathName,
  fileName,
  mockFilePath,
  schemaPath
};
