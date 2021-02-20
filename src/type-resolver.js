const { schemaPath } = require('./import-path-parser')
const { getFileSource } = require('./gql-file-parser');
const config = require('./config');
const {
  isListTypeDefiniton,
  isScalarTypeDefinition,
  isPrimitiveTypeDefinition,
  isEnumTypeDefinition,
  isTypedDefinition
} = require('./type-checker');

const { sourceJson } = getFileSource(schemaPath);

const resolvePrimitiveType = (typename) => config.resolvers[typename].default();

const resolveScalarType = (typename) => config.resolvers.ScalarTypeDefinition[typename].default();

const resolveEnumType = (typename) => {
  const enumObject = sourceJson.definitions.find(
    (definition) => definition.kind === 'EnumTypeDefinition' && definition.name.value === typename
  );

  const index = Math.floor(Math.random() * enumObject.values.length);

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

const resolveSelectionValues = (operationType, data) => {
  const returnData = { ...data };

  Object.keys(data).forEach((operationName) => {
    if (operationName === '__typename') {
      return returnData
    } else {
      const definitionObject = sourceJson.definitions.find((def) => isTypedDefinition(def, operationType));
      
      if (definitionObject) {
        const definition = definitionObject.fields.find((field) => field.name.value === operationName);
        const conditionalFragmentType = data[operationName].__typename
        const __typename = conditionalFragmentType ? conditionalFragmentType : resolveTypename(definition.type);
        
        const isListType = isListTypeDefiniton(definition.type);
        const isScalarTye = isScalarTypeDefinition(__typename);
        const isPrimitiveType = isPrimitiveTypeDefinition(__typename);
        const isEnumType = isEnumTypeDefinition(__typename);

        const resolveNestedType = () => ({
          ...resolveSelectionValues(__typename, returnData[operationName]),
          ...(config.includeTypenames ? { __typename } : {})
        })

        if (isScalarTye) {
          returnData[operationName] = resolveScalarType(__typename);
        }else if (isPrimitiveType) {
          returnData[operationName] = resolvePrimitiveType(__typename);
        } else if (isEnumType) {
          returnData[operationName] = resolveEnumType(__typename);
        } else if (isListType) {
          returnData[operationName] = [
            resolveNestedType()
          ];
        } else {
          returnData[operationName] = resolveNestedType();
        }


        return returnData;
      }
    }
  });

  return returnData;
};

module.exports = {
  resolveSelectionValues,
  resolveTypename
};
