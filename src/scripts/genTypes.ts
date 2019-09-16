import { generateNamespace } from '@gql2ts/from-schema'
import path from 'path'
import { writeFile } from 'fs'

import { genSchema } from '../utils/genSchema'

const myNamespace = generateNamespace('GQL', genSchema())
writeFile(path.join(__dirname, '../types/schema.d.ts'), myNamespace, err => {
  console.log(err)
})
