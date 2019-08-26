import { v4 } from 'uuid'
import { Redis } from 'ioredis'
import * as nodemailer from 'nodemailer'
import { forgotPasswordPrefix } from './redis'

export class EmailService {
  private _transporter: nodemailer.Transporter
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  }

  async sendMail(type: string, to: string, link: string) {
    let options = {}

    if (type === 'confirm') {
      options = {
        from: '"GraphQL Server TS" <foo@example.com>',
        to,
        subject: 'Confirm Email',
        html: `
      <html>
        <body>
        <p>Testing Mailtrap</p>
        <a href="${link}">confirm email</a>
        </body>
      </html>`
      }
    } else if (type === 'change password') {
      options = {
        from: '"GraphQL Server TS" <foo.example.com>',
        to,
        subject: 'Forgot Password',
        html: `
      <html>
        <body>
        <p>Testing Mailtrap</p>
        <a href="${link}">change password</a>
        </body>
      </html>`
      }
    }

    const res = await this._transporter.sendMail(options)
    console.log(res)
  }

  async createConfirmLink(url: string, userId: string, redis: Redis) {
    const id = v4()
    await redis.set(id, userId, 'ex', 60 * 60 * 24)
    return `${url}/confirm/${id}`
  }

  async createForgotPasswordLink(url: string, userId: string, redis: Redis) {
    const id = v4()
    await redis.set(`${forgotPasswordPrefix}${id}`, userId, 'ex', 60 * 20)
    return `${url}/change-password/${id}`
  }
}
