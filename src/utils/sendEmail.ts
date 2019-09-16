import nodemailer from 'nodemailer'

export const sendEmail = async (to: string, subject: string, linkHref: string) => {
  const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  await transport.sendMail({
    from: '"GraphQL Server TS" <graphql@server.fake>',
    to,
    subject,
    html: `
      <html>
        <body>
        <p>Testing Mailtrap</p>
        <a href="${linkHref}">${subject}</a>
        </body>
      </html>`
  })
}
