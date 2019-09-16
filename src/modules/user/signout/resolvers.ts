import { ResolverMap } from '../../../types/graphql-utils'
import { delUserSessions } from '../../../utils/delUserSessions'

export const resolvers: ResolverMap = {
  Mutation: {
    signout: async (_, __, { session, redis, res }) => {
      const { userId } = session
      if (userId) {
        delUserSessions(userId, redis)
        session.destroy(err => {
          if (err) {
            console.log(err)
          }
        })
        res.clearCookie('gsbp')
        return true
      }
      return false
    }
  }
}
