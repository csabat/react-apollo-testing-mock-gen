const { schemaPath } = require('../path-parser')
const { getFileSource } = require('../file-parser');
const config = require('../config');
const {
  isListTypeDefiniton,
  isScalarTypeDefinition,
  isPrimitiveTypeDefinition,
  isTypedDefinition
} = require('./type-checker');

const { sourceJson } = getFileSource(schemaPath);

const getEnumTypeDefinition = (typename, sourceJson) => {
  const definitionObject = sourceJson.definitions.find((definition) => definition.kind === 'EnumTypeDefinition' && definition.name.value === typename);
  
  return definitionObject;
};

const findResolver = (resolvers, fieldName) => {
  const resolverNames = Object.keys(resolvers);

  const matches = resolverNames.filter((resolverName) => {
    const re = new RegExp(`.*(${resolverName}).*`, "i");
    
    return re.test(fieldName);
  });

  if (matches.length === 0) {
    return resolvers["default"];
  }

  const accuracy = matches.map((match) => {
    return {
      resolver: resolvers[match],
      accuracy: match.length - fieldName.length
    };
  });

  return accuracy.sort((a, b) => a.accuracy - b.accuracy)[0].resolver;
};


const resolvePrimitiveType = (typename, fieldName) => {
  const resolvers = config.resolvers[typename];
  const value = findResolver(resolvers, fieldName)();

  return value;
}

const resolveScalarType = (typename) => config.resolvers.ScalarTypeDefinition[typename].default();

const resolveEnumType = (enumObject) => {
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
        const enumTypeDefinition = getEnumTypeDefinition(__typename, sourceJson);
        const isEnumType = !!enumTypeDefinition;

        const resolveNestedType = () => ({
          ...resolveSelectionValues(__typename, returnData[operationName]),
          ...(config.includeTypenames ? { __typename } : {})
        })

        if (isScalarTye) {
          returnData[operationName] = resolveScalarType(__typename);
        } else if (isPrimitiveType) {
          returnData[operationName] = resolvePrimitiveType(__typename, operationName);
        } else if (isEnumType) {
          returnData[operationName] = resolveEnumType(enumTypeDefinition);
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
