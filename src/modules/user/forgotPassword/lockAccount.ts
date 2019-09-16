import { Redis } from 'ioredis'
import { delUserSessions } from '../../../utils/delUserSessions'
import { User } from '../../../entity/User'

export const lockAccount = async (userId: string, redis: Redis) => {
  await User.update({ id: userId }, { forgotPasswordLocked: true })
  await delUserSessions(userId, redis)
}
