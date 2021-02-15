const path = require('path');

const configPath = path.join(process.cwd(), 'mockGenerator.config.js');

// eslint-disable-next-line import/no-dynamic-require
const config = require(configPath);

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

    if (config['aliasPaths']) {
      const aliasPathsNames = Object.keys(config['aliasPaths']);

      return filePaths.map((filePath) => {
        const alias = aliasPathsNames.find((aliasName) => filePath.search(aliasName) !== -1);
        const { rootPath, folder } = alias
          ? { rootPath: dirname, folder: filePath.replace(alias, config['aliasPaths'][alias]) }
          : { rootPath: parseFilePath, folder: filePath };

        return path.join(rootPath, folder);
      });
    }

    return paths;
  }

  return [];
}

const processPathName = process.cwd();

const filePathName = path.join(processPathName, process.argv[2]);
const filePathArray = filePathName.split('/');
console.log(filePathName)
console.log(filePathArray)
const fileFolderPath = filePathArray.slice(0, filePathArray.length - 1).join('/');
console.log(filePathArray.slice(0, filePathArray.length - 1))
const fileName = filePathArray[filePathArray.length - 1];
console.log(fileName)
const mockFilePath = `${fileFolderPath}/mocks/${fileName.replace('.gql', `.mock${config.fileExtension}`)}`;

module.exports = {
  getImportPaths,
  configPath,
  filePathName,
  fileFolderPath,
  processPathName,
  fileName,
  mockFilePath
};
