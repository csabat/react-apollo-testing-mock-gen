const filePath = require('path');

const configPath = filePath.join(process.cwd(), 'mockGenerator.config.js');

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

    const paths = importPaths.filter((importPath) => !!importPath);

    if (config['aliasPaths']) {
      const aliasPathsNames = Object.keys(config['aliasPaths']);

      return paths.map((path) => {
        const alias = aliasPathsNames.find((aliasName) => path.search(aliasName) !== -1);
        const { rootPath, folder } = alias
          ? { rootPath: dirname, folder: path.replace(alias, config['aliasPaths'][alias]) }
          : { rootPath: parseFilePath, folder: path };

        return filePath.join(rootPath, folder);
      });
    }

    return paths;
  }

  return [];
}

module.exports = {
  getImportPaths
};
