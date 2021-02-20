const { getImportPaths, fileFolderPath, processPathName } = require('./import-path-parser');
const { getFileSource } = require('./gql-file-parser');
const { buildSelectionStructure } = require('./query-builder');
const { resolveTypename } = require('./type-resolver');

const getFragmentDefinitions = (definitions) => {
  const fragmentDefinitions = definitions.filter((definition) => definition.kind === 'FragmentDefinition');

  const fragments = {};

  fragmentDefinitions.forEach((definition) => {
    fragments[definition.name.value] = {
      ...buildSelectionStructure(definition.selectionSet, fragments),
      __typename: resolveTypename(definition.typeCondition)
    };
  });

  return fragments;
};

const getImportedFragments = (fragmentPaths) => {
  let paths = {};

  fragmentPaths.forEach((fragmentPath) => {
    const { sourceJson } = getFileSource(fragmentPath);

    paths = {
      ...paths,
      ...getFragmentDefinitions(sourceJson.definitions)
    };
  });

  return paths;
};

const buildFragmentStuctures = (data, sourceJson) => {
  const fragmentPaths = getImportPaths(data, processPathName, fileFolderPath);
  return { ...getFragmentDefinitions(sourceJson.definitions), ...getImportedFragments(fragmentPaths) };
}

module.exports = {
  buildFragmentStuctures
}
