import { Redis } from 'ioredis'
import { v4 } from 'uuid'

import { forgotPasswordPrefix, fifteenMinutes } from '../../../constants'

export const createForgotPasswordLink = async (url: string, userId: string, redis: Redis) => {
  const id = v4()
  await redis.set(`${forgotPasswordPrefix}${id}`, userId, 'px', fifteenMinutes)
  return `${url}/change-password/${id}`
}
