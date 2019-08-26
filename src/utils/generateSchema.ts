import { mergeResolvers, mergeTypes } from 'merge-graphql-schemas'
import { makeExecutableSchema } from 'graphql-tools'
import * as glob from 'glob'
import * as fs from 'fs'
import * as path from 'path'

export const generateSchema = () => {
  const pathToModules = path.join(__dirname, '../modules')
  const types = glob
    .sync(`${pathToModules}/**/*.graphql`)
    .map(file => fs.readFileSync(file, { encoding: 'utf8' }))
  const resolvers = glob
    .sync(`${pathToModules}/**/resolvers.?s`)
    .map(file => require(file).resolvers)

  return makeExecutableSchema({ typeDefs: mergeTypes(types), resolvers: mergeResolvers(resolvers) })
}
