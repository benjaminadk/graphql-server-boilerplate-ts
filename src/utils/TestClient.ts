import * as rp from 'request-promise'

export class TestClient {
  url: string
  options: {
    jar: any
    withCredentials: boolean
    json: boolean
  }

  constructor(url: string) {
    this.url = url
    this.options = {
      withCredentials: true,
      jar: rp.jar(),
      json: true
    }
  }

  async signup(email: string, name: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: ` 
          mutation {
            signup(email: "${email}", name: "${name}", password: "${password}") {
              path
              message 
            }
          }
        `
      }
    })
  }

  async signin(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            signin(email: "${email}", password: "${password}") {
              path
              message
            }
          }
        `
      }
    })
  }

  async signout() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            signout
          }
        `
      }
    })
  }

  async forgotPasswordChange(newPassword: string, key: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            forgotPasswordChange(newPassword: "${newPassword}", key: "${key}") {
              path
              message
            }
          }
        `
      }
    })
  }

  async me() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
          {
            me {
              id
              name
              email
            }
          }
        `
      }
    })
  }
}
