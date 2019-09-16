# GraphQL Server Boilerplate TS

GraphQL server with Typeorm, Postgres, Redis

## Installation

```bash
git clone https://github.com/benjaminadk/graphql-server-boilerplate-ts.git
cd graphql-server-boilerplate-ts
npm install
```

- Start PostgreSQL
- create user & database per [ormconfig.json](https://github.com/benjaminadk/graphql-server-boilerplate-ts/blob/master/ormconfig.json) or change settings to suit needs
- Start Redis
- Create environment variables file in project root
- Setup for [Mailtrap](https://mailtrap.io/) but can work with any email service
- Uses [open](https://www.npmjs.com/package/open) to open inbox in development when confirmation email is sent

## Acknowledgements

Based on [benawad/graphql-ts-server-boilerplate](https://github.com/benawad/graphql-ts-server-boilerplate)
