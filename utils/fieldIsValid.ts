import isObject from './isObject'

export type ValidType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function'
  | 'array'

function isValidType({
  fieldName,
  isNullable,
  value,
  type,
  validator,
}: {
  fieldName: string
  isNullable?: boolean
  value: unknown
  type: ValidType | ValidType[]
  validator?: (object: unknown) => void
}): boolean {
  if (isNullable && value === null) {
    return true
  }

  if (
    type === 'array' &&
    !(Array.isArray(value) && validator && value.every(validator))
  ) {
    console.error(`array ${fieldName} is not valid`)
    return false
  } else if (
    type !== 'array' &&
    typeof type === 'string' &&
    typeof value !== type
  ) {
    console.error(`${fieldName} is not type ${type}`)
    return false
  }

  if (Array.isArray(type) && !type.includes(typeof value)) {
    console.error(`${fieldName} is not in type ${type.join(' | ')}`)
    return false
  }

  return true
}

export interface ValidateArgs<FieldNames = string> {
  fieldName: FieldNames
  isNullable?: boolean
  type: ValidType | ValidType[]
  validator?: (object: unknown) => void
}

export default function fieldIsValid({
  fieldName,
  object,
  isNullable,
  type,
  validator,
}: ValidateArgs & {
  object: unknown
}): boolean {
  if (!isObject(object)) {
    console.error('Not an object')
    return false
  }

  if (!(fieldName in object)) {
    console.error(`${fieldName} is not in object`)
    return false
  }

  const value = object[fieldName]

  if (!isValidType({ fieldName, validator, isNullable, value, type })) {
    console.error(`${fieldName} type is not valid`)
    return false
  }

  return true
}
