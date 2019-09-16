import { Redis } from 'ioredis'
import { v4 } from 'uuid'

import { oneDay } from '../../../constants'

export const createConfirmLink = async (url: string, userId: string, redis: Redis) => {
  const id = v4()
  await redis.set(id, userId, 'px', oneDay)
  return `${url}/confirm/${id}`
}
