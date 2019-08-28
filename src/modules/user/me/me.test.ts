import { Connection } from 'typeorm'
import * as faker from 'faker'
import { User } from '../../../entity/User'
import { TestClient } from '../../../utils/TestClient'
import { createTestConnection } from '../../../testUtils/createTestConnection'

let userId: string
let conn: Connection
faker.seed(Date.now())
const email = faker.internet.email()
const name = faker.internet.userName()
const password = faker.internet.password()

beforeAll(async () => {
  conn = await createTestConnection()
  const user = await User.create({
    email,
    name,
    password,
    confirmed: true
  }).save()
  userId = user.id
})

afterAll(async () => {
  conn.close()
})

describe('me', () => {
  test('return null if no cookie', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)
    const response = await client.me()
    expect(response.data.me).toBeNull()
  })

  test('get current user', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)
    await client.signin(email, password)
    const response = await client.me()

    expect(response.data).toEqual({
      me: {
        id: userId,
        name,
        email
      }
    })
  })
})
