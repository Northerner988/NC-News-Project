const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const allEndPoints = require("../endpoints.json");
require("jest-sorted");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("GET /unavailable-endpoint", () => {
  test("Status 404 - responds with unavailable endpoint requested", () => {
    return request(app).get("/api/not-an-endpoint").expect(404);
  });
});

describe("GET /api", () => {
  test("Status 200 - responds with JSON describing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(allEndPoints);
      });
  });
});

describe("Get /api/topics", () => {
  test("Status 200 - responds with an array of all topic objects ", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics.length).toBe(3);
        body.topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});

describe("Get /api/articles", () => {
  test("Status 200 - responds with an array of all the article objects sorted by date in descending order. ", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(12);
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
        body.articles.forEach((article) => {
          expect(article.body).toBe(undefined);
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("Status 200 - responds with the specified article object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        const { article } = response.body;
        expect(article.article_id).toBe(1);
        expect(article.title).toBe("Living in the shadow of a great man");
        expect(article.topic).toBe("mitch");
        expect(article.author).toBe("butter_bridge");
        expect(article.body).toBe("I find this existence challenging");
        expect(article.created_at).toBe("2020-07-09T20:11:00.000Z");
        expect(article.votes).toBe(100);
        expect(article.article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
      });
  });
  test("Status 400 - invalid article ID ", () => {
    return request(app)
      .get("/api/articles/25Al")
      .expect(400)
      .then(({ body }) => expect(body.msg).toBe("Bad request - ID is invalid"));
  });
  test("Status 404 - valid but non-existent article ID", () => {
    return request(app)
      .get("/api/articles/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("ID not found");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("Status 200 - responds with the comments corresponding to the specified article, sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        expect(comments.length).toBe(2);
        expect(comments).toBeSortedBy("created_at", { descending: true });
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            body: expect.any(String),
            article_id: expect.any(Number),
          });
        });
      });
  });
  test("Status 200 - responds with an empty array for article that has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        expect(comments).toEqual([]);
      });
  });

  test("Status 400 - invalid article ID ", () => {
    return request(app)
      .get("/api/articles/25Nonsense/comments")
      .expect(400)
      .then(({ body }) => expect(body.msg).toBe("Bad request - ID is invalid"));
  });
  test("Status 404 - valid but non-existent article ID", () => {
    return request(app)
      .get("/api/articles/99999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
});

describe("Post /api/articles/:article_id/comments", () => {
  test("Status 201 - responds with the newly added comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Just another random comment.",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toEqual({
          article_id: 3,
          author: "butter_bridge",
          body: "Just another random comment.",
          comment_id: 19,
          created_at: expect.any(String),
          votes: 0,
        });
      });
  });
  test("Status 400 - missing properties from post body ", () => {
    const newComment = {
      username: "butter_bridge",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid post body");
      });
  });
  test("Status 400 - properties in incorrect format ", () => {
    const newComment = {
      username: "butter_bridge",
      body: null,
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid post body");
      });
  });
  test("Status 400 - invalid article ID ", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Just another random comment.",
    };
    return request(app)
      .post("/api/articles/25Nonsense/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => expect(body.msg).toBe("Bad request - ID is invalid"));
  });
  test("status 404 - valid but non-existent username ", () => {
    const newComment = {
      username: "cool_dev",
      body: "Just another random comment.",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Username not found");
      });
  });
  test("Status 404 - valid but non-existent article ID", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Just another random comment.",
    };
    return request(app)
      .post("/api/articles/99911/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article ID not found");
      });
  });
});
