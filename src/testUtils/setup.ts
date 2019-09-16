import { startServer } from '../startServer'

export const setup = async () => {
  const listener = await startServer()
  const { port } = listener.address()
  process.env.TEST_HOST = `http://127.0.0.1:${port}`
}
