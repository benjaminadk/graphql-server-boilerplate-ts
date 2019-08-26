import { getConnectionOptions, createConnection } from 'typeorm'

export const createTypeormConnection = async () => {
  const options = await getConnectionOptions(process.env.NODE_ENV)
  return createConnection({ ...options, name: 'default' })
}
