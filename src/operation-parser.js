const getOperationDefinition = (sourceJson) => {
  return sourceJson.definitions.find((def) => def.kind === 'OperationDefinition');
}

const getVariables = (variableDefinitions) => {
  const variables = {};

  variableDefinitions.forEach((variableDefinition) => {
    variables[variableDefinition.variable.name.value] = ''
  });

  return variables;
}

module.exports = {
  getVariables,
  getOperationDefinition
};
