import { Redis } from 'ioredis'
import { userSessionIdPrefix, sessionPrefix } from '../constants'

export const removeAllUserSessions = async (userId: string, redis: Redis) => {
  const sessionIds = await redis.lrange(`${userSessionIdPrefix}${userId}`, 0, -1)

  const promises = []

  for (const id of sessionIds) {
    promises.push(redis.del(`${sessionPrefix}${id}`))
  }

  await Promise.all(promises)
}
