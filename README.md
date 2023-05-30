# NC News API

Live version: https://nc-news-iymk.onrender.com

This project is a RESTful API for a news website. It is built using Node.js, Express.js and PostgreSQL.

## Getting Started

## Setup Instructions

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
