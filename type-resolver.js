const fs = require('fs');
const path = require('path');
const { parse, Source } = require('graphql');

const configPath = path.join(process.cwd(), 'mockGenerator.config.js');

// eslint-disable-next-line import/no-dynamic-require
const config = require(configPath);
const schemaPath = path.join(process.cwd(), config.schemaPath);
const schemaJsonPath = `${__dirname}/querySchema.json`;
const schema = fs.readFileSync(schemaPath);
const source = new Source(schema.toString());

fs.writeFileSync(`${__dirname}/querySchema.json`, JSON.stringify(parse(source, { noLocation: true }), null, 2), () => {});
const schemaJson = require(schemaJsonPath);

const resolvePrimitiveType = (typename) => config.resolvers[typename].default();

const resolveScalarType = (typename) => config.resolvers.ScalarTypeDefinition[typename].default();

const resolveEnumType = (typename) => {
  const enumObject = schemaJson.definitions.find(
    (definition) => definition.kind === 'EnumTypeDefinition' && definition.name.value === typename
  );

  const index = Math.floor(Math.random() * enumObject.values.length - 1) + 1;

  return enumObject.values[index].name.value;
};

const resolveTypename = (type) => {
  let typename;

  if (type && type.type) {
    typename = resolveTypename(type.type);
  } else if (type.name) {
    typename = type.name.value;
  }

  return typename;
};

const getIsListType = (type, isList = false) => {
  let isListType = isList;

  if (isListType) {
    return isListType;
  }

  if (type && type.kind) {
    isListType = type.kind === 'ListType';
  } else if (!type || !type.type || !type.kind) {
    return isListType;
  }

  return getIsListType(type.type, isListType);
};

const isTypedDefinition = (definition, operationType) =>
  (definition.kind === 'ObjectTypeDefinition' || definition.kind === 'InterfaceTypeDefinition') &&
  definition.name.value === operationType;

// combines the data object with typenames
const getOperationsWithReturnTypes = (operationType, data) => {
  const returnData = { ...data };

  Object.keys(data).forEach((operationName) => {
    if (operationName === '__typename') {
      returnData[operationName] = operationType;
    } else {
      const definitionObject = schemaJson.definitions.find((def) => isTypedDefinition(def, operationType));

      if (definitionObject) {
        const definition = definitionObject.fields.find((field) => field.name.value === operationName);
        const __typename = resolveTypename(definition.type);
        const isList = getIsListType(definition.type);

        const isScalarTyepDefinition = Object.keys(config.resolvers.ScalarTypeDefinition).includes(__typename);
        const isPrimitiveType = Object.keys(config.resolvers).includes(__typename);
        const isEnumTypeDefinition = __typename === 'EnumTypeDefinition';

        if (isScalarTyepDefinition) {
          returnData[operationName] = resolveScalarType(__typename);

          return returnData;
        }

        if (isPrimitiveType) {
          returnData[operationName] = resolvePrimitiveType(__typename);

          return returnData;
        }

        if (isEnumTypeDefinition) {
          returnData[operationName] = resolveEnumType(__typename);

          return returnData;
        }

        if (isList) {
          returnData[operationName] = [
            {
              ...getOperationsWithReturnTypes(__typename, returnData[operationName]),
              ...(config.includeTypenames ? { __typename } : {})
            }
          ];

          return returnData;
        }

        returnData[operationName] = {
          ...getOperationsWithReturnTypes(__typename, returnData[operationName]),
          ...(config.includeTypenames ? { __typename } : {})
        };

        return returnData;
      }
    }
  });

  return returnData;
};

module.exports = {
  getOperationsWithReturnTypes,
  resolveTypename,
  schemaJsonPath
};
