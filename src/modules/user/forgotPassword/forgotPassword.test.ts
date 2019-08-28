import { Connection } from 'typeorm'
import * as Redis from 'ioredis'
import * as faker from 'faker'
import { User } from '../../../entity/User'
import { TestClient } from '../../../utils/TestClient'
import { EmailService } from '../../../services/EmailService'
import { forgotPasswordLockAccount } from '../../../utils/forgotPasswordLockAccount'
import { passwordNotLongEnough } from '../signup/errorMessages'
import { expiredKey } from './errorMessages'
import { forgotPasswordLockedError } from '../signin/errorMessages'
import { createTestConnection } from '../../../testUtils/createTestConnection'

let conn: Connection
export const redis = new Redis()
faker.seed(Date.now())
const email = faker.internet.email()
const name = faker.internet.userName()
const password = faker.internet.password()
const newPassword = faker.internet.password()

let userId: string
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

describe('forgot password', () => {
  test('make sure it works', async () => {
    const client = new TestClient(process.env.TEST_HOST as string)

    // lock account
    await forgotPasswordLockAccount(userId, redis)
    const emailService = new EmailService()
    const url = await emailService.createForgotPasswordLink(
      process.env.TEST_HOST as string,
      userId,
      redis
    )

    const parts = url.split('/')
    const key = parts[parts.length - 1]

    // make sure you can't login to locked account
    expect(await client.signin(email, password)).toEqual({
      data: {
        signin: [
          {
            path: 'email',
            message: forgotPasswordLockedError
          }
        ]
      }
    })

    // try changing to a password that's too short
    expect(await client.forgotPasswordChange('a', key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: 'newPassword',
            message: passwordNotLongEnough
          }
        ]
      }
    })

    const response = await client.forgotPasswordChange(newPassword, key)

    expect(response.data).toEqual({
      forgotPasswordChange: null
    })

    // make sure redis key expires after password change
    expect(await client.forgotPasswordChange(faker.internet.password(), key)).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: 'key',
            message: expiredKey
          }
        ]
      }
    })

    expect(await client.signin(email, newPassword)).toEqual({
      data: {
        signin: null
      }
    })
  })
})
