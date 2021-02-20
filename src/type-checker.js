const config = require('./config');

const isListTypeDefiniton = (type, isList = false) => {
  let isListType = isList;

  if (isListType) {
    return isListType;
  }

  if (type && type.kind) {
    isListType = type.kind === 'ListType';
  } else if (!type || !type.type || !type.kind) {
    return isListType;
  }

  return isListTypeDefiniton(type.type, isListType);
};

const isScalarTypeDefinition = (typename) => Object.keys(config.resolvers.ScalarTypeDefinition).includes(typename);
const isPrimitiveTypeDefinition = (typename) => Object.keys(config.resolvers).includes(typename);
const isEnumTypeDefinition = (typename) => typename === 'EnumTypeDefinition';

const isTypedDefinition = (definition, operationType) => {
  return (definition.kind === 'ObjectTypeDefinition' || definition.kind === 'InterfaceTypeDefinition') &&
  definition.name.value === operationType;
};

module.exports = {
  isListTypeDefiniton,
  isScalarTypeDefinition,
  isPrimitiveTypeDefinition,
  isEnumTypeDefinition,
  isTypedDefinition
}
