const request = require("supertest");
const app = require("../app.js");
const db = require("../db/connection");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const allEndPoints = require("../endpoints.json");
const users = require("../db/data/test-data/users.js");
require("jest-sorted");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("GET /unavailable-endpoint", () => {
  test("STATUS 404 - responds with unavailable endpoint requested", () => {
    return request(app).get("/api/not-an-endpoint").expect(404);
  });
});

describe("GET /api", () => {
  test("STATUS 200: responds with JSON describing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(allEndPoints);
      });
  });
});

describe("Get /api/topics", () => {
  test("STATUS 200: responds with an array of all topic objects ", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics).toBeInstanceOf(Array);
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            description: expect.any(String),
            slug: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/users", () => {
  test("STATUS 200: responds with an array of all the users objects ", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toBeInstanceOf(Array);
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("Get /api/articles", () => {
  test("STATUS 200: responds with an array of all the article objects sorted by date, in descending order ", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(12);
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
  test("STATUS 200: responds with an object for the specified article", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((response) => {
        const { article } = response.body;
        expect(article).toBeInstanceOf(Object);
        expect(article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("STATUS 400: invalid article ID format", () => {
    return request(app)
      .get("/api/articles/25Al")
      .expect(400)
      .then(({ body }) =>
        expect(body.msg).toBe("Bad request - invalid data type")
      );
  });
  test("STATUS 404: valid but non-existent article ID", () => {
    return request(app)
      .get("/api/articles/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("ID not found");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("STATUS 200: responds with the comments corresponding to the specified article, sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(2);
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
  test("STATUS 200: responds with an empty array for an article that has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then((response) => {
        const { comments } = response.body;
        expect(comments).toEqual([]);
      });
  });
  test("STATUS 400: invalid article ID", () => {
    return request(app)
      .get("/api/articles/25Nonsense/comments")
      .expect(400)
      .then(({ body }) =>
        expect(body.msg).toBe("Bad request - invalid data type")
      );
  });
  test("STATUS 404: valid but non-existent article ID", () => {
    return request(app)
      .get("/api/articles/99999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("ID not found");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("STATUS 201: responds with the newly added comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Just another random comment.",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toEqual({
          article_id: 3,
          author: "butter_bridge",
          body: "Just another random comment.",
          comment_id: 19,
          created_at: expect.any(String),
          votes: 0,
        });
      });
  });
  test("STATUS 201: any additional properties in post body are ignored ", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Just another random comment.",
      extra: "This property will be ignored",
      anotherExtra: "This property will also be ignored",
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
  test("STATUS 400: missing required properties from post body ", () => {
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
  test("STATUS 400: properties in incorrect format ", () => {
    const newComment = {
      username: "butter_bridge",
      wrongBody: "....i should not be here",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid post body");
      });
  });
  test("STATUS 400: invalid article ID ", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Just another random comment.",
    };
    return request(app)
      .post("/api/articles/25Nonsense/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) =>
        expect(body.msg).toBe("Bad request - invalid data type")
      );
  });
  test("STATUS 404: valid but non-existent username ", () => {
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
  test("STATUS 404: valid but non-existent article ID", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Just another random comment.",
    };
    return request(app)
      .post("/api/articles/99911/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("ID not found");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("STATUS 200 - increments the given articles' votes and returns it", () => {
    const newVote = { inc_votes: 20 };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          body: "I find this existence challenging",
          votes: 120,
          topic: "mitch",
          author: "butter_bridge",
          created_at: expect.any(String),
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("STATUS 200: decrements the given articles' votes and returns it", () => {
    const newVote = { inc_votes: -20 };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual({
          article_id: 1,
          title: "Living in the shadow of a great man",
          body: "I find this existence challenging",
          votes: 80,
          topic: "mitch",
          author: "butter_bridge",
          created_at: expect.any(String),
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("STATUS 400: incomplete request body ", () => {
    const newVote = {};
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid post body");
      });
  });
  test("STATUS 400: invalid votes format ", () => {
    const newVote = { inc_votes: "twenty" };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request - invalid data type");
      });
  });
  test("STATUS 400: invalid article ID", () => {
    const newVote = { inc_votes: 20 };
    return request(app)
      .patch("/api/articles/25Nonsense")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request - invalid data type");
      });
  });
  test("STATUS 404: valid but non-existent article ID", () => {
    const newVote = { inc_votes: 20 };
    return request(app)
      .patch("/api/articles/99999")
      .send(newVote)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("ID not found");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("STATUS 204: responds with no content when comment is successfully deleted ", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
  test("STATUS 400: invalid comment ID", () => {
    return request(app)
      .delete("/api/comments/1Nonsense")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request - invalid data type");
      });
  });
  test("STATUS 404: valid but non-existent comment ID ", () => {
    return request(app)
      .delete("/api/comments/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment ID not found");
      });
  });
});
