import { Redis } from 'ioredis'
import * as express from 'express'

export interface Session extends Express.Session {
  userId?: string
}

export interface Context {
  redis: Redis
  url: string
  session: Session
  req: Express.Request
  res: express.Response
}

export type Resolver = (parent: any, args: any, context: Context, info: any) => any

export type GraphQLMiddlewareFunc = (
  resolver: Resolver,
  parent: any,
  args: any,
  context: Context,
  info: any
) => any

export interface ResolverMap {
  [key: string]: {
    [key: string]: Resolver
  }
}
