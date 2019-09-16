import faker from 'faker'
import { Connection } from 'typeorm'

import { User } from '../../../entity/User'
import { TestClient } from '../../../utils/TestClient'
import { connectTest } from '../../../testUtils/connectTest'

faker.seed(Date.now())
const email = faker.internet.email()
const name = faker.internet.userName()
const password = faker.internet.password()

let userId: string
let conn: Connection

beforeAll(async () => {
  conn = await connectTest()
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

describe('signout', () => {
  test('multiple sessions', async () => {
    const sess1 = new TestClient(process.env.TEST_HOST as string)
    const sess2 = new TestClient(process.env.TEST_HOST as string)

    await sess1.signin(email, password)
    await sess2.signin(email, password)
    expect(await sess1.me()).toEqual(await sess2.me())
    await sess1.signout()
    expect(await sess1.me()).toEqual(await sess2.me())
  })

  test('single session', async () => {
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

    await client.signout()

    const response2 = await client.me()

    expect(response2.data.me).toBeNull()
  })
})
