# Northcoders News API ⚙️

This project is a RESTful API for a news website. It is built using Node.js, Express.js and PostgreSQL.

The hosted version of the API is available here: https://nc-news-iymk.onrender.com

You can find the front-end web app which utilises this API here: https://northcoders-newsite.netlify.app/

## Getting Started

### Minimum requirements

To run this project, you must have the following installed:

- Node: v19 or above
- Postgres: v14 or above

### Clone this repository

In your terminal:

```
$ git clone https://github.com/Northerner988/NC-News-Project.git
```

Navigate into the repo:

```
$ cd NC-News-Project
```

### Install dependencies:

```
$ npm install
```

### Environment setup

In order to successfully connect to the databases locally, you must setup the necessary environment variables.

### 1.

Create two files in the root directory:

`.env.test`

`.env.development`

### 2.

The contents of files should be formatted as follows:

For the **test** file

```
PGDATABASE=nc_news_test
```

For the **development** file

```
PGDATABASE=nc_news
```

### Create and seed the databases

To setup the databases and seed them with data:

```
npm run setup-dbs
npm run seed
```

## Testing

To run tests on the endpoints:

```
npm test
```
