import { getConnectionOptions, createConnection } from 'typeorm'

export const createTestConnection = async (resetDatabase: boolean = false) => {
  const connectionOptions = await getConnectionOptions(process.env.NODE_ENV)
  return createConnection({
    ...connectionOptions,
    name: 'default',
    synchronize: resetDatabase,
    dropSchema: resetDatabase
  })
}
