import { generateNamespace } from '@gql2ts/from-schema'
import * as path from 'path'
import * as fs from 'fs'

import { generateSchema } from '../utils/generateSchema'

const myNamespace = generateNamespace('GQL', generateSchema())
fs.writeFile(path.join(__dirname, '../types/schema.d.ts'), myNamespace, err => {
  console.log(err)
})
