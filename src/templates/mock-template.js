const config = require('../config');
const { capitalize } = require('../utils');

const getMockTemplate = (name, variables, result, queryFileName) => `
const queryDocument = require('../${queryFileName}');

export const mock${capitalize(name)} = () => [
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

const mockTemplate = config.mockTemplate ? config.mockTemplate : getMockTemplate;

module.exports = {
  mockTemplate
}
