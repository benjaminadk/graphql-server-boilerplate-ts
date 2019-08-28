import { Connection } from 'typeorm'
import * as faker from 'faker'

import { invalidCredentials, confirmEmailError } from './errorMessages'
import { User } from '../../../entity/User'
import { TestClient } from '../../../utils/TestClient'
import { createTestConnection } from '../../../testUtils/createTestConnection'

faker.seed(Date.now())
const email = faker.internet.email()
const name = faker.internet.userName()
const password = faker.internet.password()

const client = new TestClient(process.env.TEST_HOST as string)

let conn: Connection
beforeAll(async () => {
  conn = await createTestConnection()
})
afterAll(async () => {
  conn.close()
})

const signinExpectError = async (e: string, p: string, errMsg: string) => {
  const response = await client.signin(e, p)

  expect(response.data).toEqual({
    signin: [
      {
        path: 'email',
        message: errMsg
      }
    ]
  })
}

describe('signin', () => {
  test('email not found send back error', async () => {
    await signinExpectError(faker.internet.email(), faker.internet.password(), invalidCredentials)
  })

  test('email not confirmed', async () => {
    await client.signup(email, name, password)

    await signinExpectError(email, password, confirmEmailError)

    await User.update({ email }, { confirmed: true })

    await signinExpectError(email, faker.internet.password(), invalidCredentials)

    const response = await client.signin(email, password)

    expect(response.data).toEqual({ signin: null })
  })
})
