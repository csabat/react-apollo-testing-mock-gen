const fs = require('fs');
const { Source, parse } = require('graphql');
const { resolveTypename } = require('./type-resolver');

const getFragmentDefinitions = (definitions) => {
  const fragmentDefinitions = definitions.filter((definition) => definition.kind === 'FragmentDefinition');

  const fragments = {};

  fragmentDefinitions.forEach((definition) => {
    fragments[definition.name.value] = {
      ...getSelectionSet(definition.selectionSet, fragments),
      __typename: resolveTypename(definition.typeCondition)
    };
  });

  return fragments;
};

const resolveFragmentPath = (fragmentPaths) => {
  let paths = {};

  fragmentPaths.forEach((fragmentPath) => {
    const fragmentObj = fs.readFileSync(fragmentPath);
    const source = new Source(fragmentObj.toString());
    const sourceJson = parse(source, { noLocation: true });

    paths = {
      ...paths,
      ...getFragmentDefinitions(sourceJson.definitions)
    };
  });

  return paths;
};

const getSelectionSet = (obj, fragments = {}) => {
  let node = {};

  if (Array.isArray(obj.selections)) {
    obj.selections.forEach((selection) => {
      if (selection.kind === 'InlineFragment') {
        // return getSelectionSet(selection.selectionSet, fragments)
      } else if (selection.kind === 'FragmentSpread') {
        /// if it is a Fragment get the object defined in fragments

        node = fragments[selection.name.value] || 'Could not resolve fragment';
      } else if (selection.selectionSet) {
        node[selection.name.value] = getSelectionSet(selection.selectionSet, fragments);
      } else {
        node[selection.name.value] = '';
      }
    });
  }

  return node;
};

module.exports = {
  getFragmentDefinitions,
  getSelectionSet,
  resolveFragmentPath
};
