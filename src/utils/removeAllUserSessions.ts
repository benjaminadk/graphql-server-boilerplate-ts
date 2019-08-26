import { Redis } from 'ioredis'
import { userSessionIdPrefix, sessionPrefix } from '../services/redis'

export const removeAllUserSessions = async (userId: string, redis: Redis) => {
  const sessionIds = await redis.lrange(`${userSessionIdPrefix}${userId}`, 0, -1)

  const promises = []

  for (let i = 0; i < sessionIds.length; i++) {
    promises.push(redis.del(`${sessionPrefix}${sessionIds[i]}`))
  }
  await Promise.all(promises)
}
