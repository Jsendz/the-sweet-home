import { propertySchema } from './property'
import { agentSchema } from './agent'

export { propertySchema, agentSchema }

/** All schemas registered with Sanity Studio */
export const schemaTypes = [agentSchema, propertySchema]
