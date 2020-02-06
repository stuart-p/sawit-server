# **SAWIT!** A website not too dissimilar from REDDIT...

**[ Live server can be directly accessed at https://sawit-server.herokuapp.com/](https://sawit-server.herokuapp.com/)**

This is the server-side code for my portfolio project; SAWIT. This website can be used to post and vote on articles and comments on various topics, in a similar fashion to REDDIT. Backend is **Node.js**, frontend is **REACT**. All data is stored in a **PostgreSQL** database.

## Getting Started (usage)

The server is obviously meant to be accessed via a front end, however the API can also be accessed directly through https://sawit-server.herokuapp.com/api. The following end-points are currently in operation:

```
Sawit-server.herokuapp.com
├── /api (GET)
      ├── /topics (GET)
      ├── /articles (GET [sort_by, order, author, topic])
            ├── /:article_id (GET, PATCH)
                    ├── /comments (GET [sort_by, order], POST)
                    ├── /:article_id (GET, PATCH [inc_vote])
      ├── /users
              ├── /:username (GET)
      ├── /comments
              ├── /:comment_id (PATCH [inc_vote], DELETE)

```

It is recommended that endpoints are interrogated using a RESTful API test tool, such as [Insomnia](insomnia.rest).

The frontend is accessible through [tbd]()

## Getting Started (development)

If you would like to get your own example of this server up and running, you can use these instructions to start a local instance for development and testing purposes. See deployment for notes on how to deploy the project to a live system.

### Prerequisites

This project requires `NODE`, and has the following dependencies:

```
production dependencies:
    express: ^4.17.1
    knex: ^0.20.8
    pg: ^7.18.1

  development dependencies:
    sams-chai-sorted: ^1.0.2
    chai: ^4.2.0
    mocha: ^7.0.1
    nodemon: ^2.0.2
    supertest: ^4.0.2
  }
```

### Installing

to install:

- run `npm install`
- create a `knexfile.js` in the root directory, which will contain the configuration data for the database connection. it should follow the following format:

```
const ENV = process.env.NODE_ENV || "development";
const { DB_URL } = process.env;

const baseConfig = {
  client: "pg",
  migrations: {
    directory: "./db/migrations"
  },
  seeds: {
    directory: "./db/seeds"
  }
};

const customConfig = {
  development: {
    connection: {
      database: nc_news
      username: *database login credentials*
      password: *database login credentials*
    }
  },
  test: {
    connection: {
      database: nc_news_test
      username: *database login credentials*
      password: *database login credentials*
    }
  },
  production: {
    connection: `${DB_URL}?ssl=true`
  }
};

module.exports = { ...customConfig[ENV], ...baseConfig };
```

Note that username and password fields should be added if required.

- if you wish to change the name of the databases, it should be changed both in the knexfile and also in /db/setup.sql
- run `npm run setup-dbs` to spawn the empty databases
- run `npm run seed` to setup the database and seed it with arbitrary data
- run `npm run start-local-server` to spin up a local server instance, listening on port 8080
- You should now be able to send requests to the end points at localhost:8080 !

## Testing

This project was built you Test Driven Development (TDD) principles. The test suite consisted of the following tools:

```
Mocha
Chai
Supertest
sams-chai-sorted
```

Utility tests are located in /spec/utils.spec.js. These tests are for individual functions required for manipulating data from the database. They do not involve connection to the database itself.

Server endpoint tests are located in /spec/app.spec.js. These are integration tests for the server API, including error handling around end points.

Tests can be run by invoking: `npm run test-utils` and `npm test`

## Deployment

This project was designed to be deployed via Heroku. To deploy your own instance of this project, perform the following steps:

- install heroku, for example using `brew tap heroku/brew && brew install heroku` (macOS)
- login to your account using `heroku login`
- create a heroku git repo using `heroku create *name of repo*`
- push to the remote Heroku repo
- in the Heroku web app, select the newly-created application, add 'Heroku Postgres' to the configuration
- seed the Heroku database using `npm run seed:prod`

## Built with

This project was built on VSCode, using the `NODE.js` framework

## Author

This project was built by **Stuart Palmer** while studying at _NorthCoders_, in February 2020.
