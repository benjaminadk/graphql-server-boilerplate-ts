import { mergeResolvers, mergeTypes } from 'merge-graphql-schemas'
import { makeExecutableSchema } from 'graphql-tools'
import glob from 'glob'
import { readFileSync } from 'fs'
import path from 'path'

export const genSchema = () => {
  const pathToModules = path.join(__dirname, '../modules')
  const types = glob
    .sync(`${pathToModules}/**/*.graphql`)
    .map(file => readFileSync(file, { encoding: 'utf8' }))
  const resolvers = glob
    .sync(`${pathToModules}/**/resolvers.?s`)
    .map(file => require(file).resolvers)

  return makeExecutableSchema({ typeDefs: mergeTypes(types), resolvers: mergeResolvers(resolvers) })
}
