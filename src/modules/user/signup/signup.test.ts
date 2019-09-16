import { Connection } from 'typeorm'
import faker from 'faker'

import { User } from '../../../entity/User'
import { duplicateEmail, invalidEmail, emailMin, nameMin, passwordMin } from './errorMessages'
import { TestClient } from '../../../utils/TestClient'
import { connectTest } from '../../../testUtils/connectTest'

const client = new TestClient(process.env.TEST_HOST as string)

faker.seed(Date.now())
const email = faker.internet.email()
const name = faker.internet.userName()
const password = faker.internet.password()

let conn: Connection
beforeAll(async () => {
  conn = await connectTest()
})
afterAll(async () => {
  conn.close()
})

describe('signup user', () => {
  it('checks for duplicate email', async () => {
    const response1 = await client.signup(email, name, password)
    expect(response1.data).toEqual({ signup: null })
    const users = await User.find({ where: { email } })
    expect(users).toHaveLength(1)
    const user = users[0]
    expect(user.email).toEqual(email)
    expect(user.name).toEqual(name)
    expect(user.password).not.toEqual(password)

    const response2 = await client.signup(email, name, password)
    expect(response2.data.signup).toHaveLength(1)
    expect(response2.data.signup[0]).toEqual({
      path: 'email',
      message: duplicateEmail
    })
  })

  it('checks for invalid email', async () => {
    const response1 = await client.signup('xx', name, password)
    expect(response1.data).toEqual({
      signup: [
        {
          path: 'email',
          message: emailMin
        },
        {
          path: 'email',
          message: invalidEmail
        }
      ]
    })

    const response2 = await client.signup('notanemail@', name, password)
    expect(response2.data.signup[0]).toEqual({
      path: 'email',
      message: invalidEmail
    })
  })

  it('checks for invalid name', async () => {
    const response1 = await client.signup(faker.internet.email(), 'xx', faker.internet.password())
    expect(response1.data).toEqual({
      signup: [
        {
          path: 'name',
          message: nameMin
        }
      ]
    })
  })

  it('checks for invalid password', async () => {
    const response1 = await client.signup(faker.internet.email(), faker.internet.userName(), 'xx')
    expect(response1.data).toEqual({
      signup: [
        {
          path: 'password',
          message: passwordMin
        }
      ]
    })
  })

  it('checks invalid email, name, and password', async () => {
    const response1 = await client.signup('xx', 'xx', 'xx')
    expect(response1.data).toEqual({
      signup: [
        {
          path: 'email',
          message: emailMin
        },
        {
          path: 'email',
          message: invalidEmail
        },
        {
          path: 'name',
          message: nameMin
        },
        {
          path: 'password',
          message: passwordMin
        }
      ]
    })
  })
})
