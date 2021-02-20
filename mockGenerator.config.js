module.exports = {
  schemaPath: './schema.graphql',
  aliasPaths: {
    '@zen': './frontend'
  },
  // lint your mock file by prividing funtion ex.  (path) => `yarn eslint ${path} --fix`,
  lint: null,
  fileExtension: '.ts',
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
    ScalarTypeDefinition: {
      Date: {
        default: () => '2020-02-02'
      },
      ISO8601DateTime: {
        default: () => new Date().toISOString()
      }
    }
  }
};
