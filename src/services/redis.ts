import * as Redis from 'ioredis'

export const redis = new Redis()
export const sessionPrefix = 'sess:'
export const userSessionIdPrefix = 'userSids:'
export const forgotPasswordPrefix = 'forgotPassword:'
