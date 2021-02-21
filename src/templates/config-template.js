const configTemplate = (fileExtension, schemaPath) => `
  module.exports = {
    schemaPath: '${schemaPath}',
    aliasPaths: null,
    lint: null,
    fileExtension: '${fileExtension}',
    includeTypenames: true,
    resolvers: {
      String: {
        default: () => 'random text'
      },
      Int: {
        default: () => Math.floor(Math.random() * 20) + 1
      },
      Float: {
        default: () => Math.floor(Math.random() * (1000 - 100) + 100) / 100
      },
      Boolean: {
        default: () => Math.random() <= 0.5
      },
      ScalarTypeDefinition: {},
    }
  };
  `

  module.exports = configTemplate;
  