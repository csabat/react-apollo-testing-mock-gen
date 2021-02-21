
const { resolveTypename } = require('../type-resolver');

const buildSelectionStructure = (obj, fragments = {}) => {
  let node = {};

  if (Array.isArray(obj.selections)) {
    obj.selections.forEach((selection) => {
      if (selection.kind === 'InlineFragment') {
        node = {      
          ...buildSelectionStructure(selection.selectionSet, fragments),
          __typename: resolveTypename(selection.typeCondition)
        }
      } else if (selection.kind === 'FragmentSpread') {
        node = fragments[selection.name.value] || 'Could not resolve fragment';
      } else if (selection.selectionSet) {
        node[selection.name.value] = buildSelectionStructure(selection.selectionSet, fragments);
      } else {
        node[selection.name.value] = '';
      }
    });
  }

  return node;
};

const getVariables = (variableDefinitions) => {
  const variables = {};

  variableDefinitions.forEach((variableDefinition) => {
    variables[variableDefinition.variable.name.value] = ''
  });

  return variables;
}

module.exports = {
  buildSelectionStructure,
  getVariables
}