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

describe("POST /api/topics", () => {
  test("STATUS 201: responds with the newly added topic", () => {
    const newTopic = {
      slug: "watermelons",
      description: "The best fruit",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(201)
      .then(({ body }) => {
        const { topic } = body;
        expect(topic).toEqual({
          slug: "watermelons",
          description: "The best fruit",
        });
      });
  });
  test("STATUS 201: any additional properties in post body are ignored ", () => {
    const newTopic = {
      slug: "watermelons",
      description: "The best fruit",
      extra: "This property will be ignored",
      anotherExtra: "This property will also be ignored",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(201)
      .then(({ body }) => {
        const { topic } = body;
        expect(topic).toEqual({
          slug: "watermelons",
          description: "The best fruit",
        });
      });
  });
  test("STATUS 400: missing required properties from post body ", () => {
    const newTopic = {
      slug: "watermelons",
    };
    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Missing required fields");
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

describe("GET /api/users/:username", () => {
  test("STATUS 200: responds with an object for the specified user", () => {
    return request(app)
      .get("/api/users/rogersop")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toBeInstanceOf(Object);
        expect(users).toEqual({
          username: "rogersop",
          name: "paul",
          avatar_url:
            "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
        });
      });
  });
  test("STATUS 404: valid but non-existent user", () => {
    return request(app)
      .get("/api/users/nonexistent_user")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Username not found");
      });
  });
});

describe("Get /api/articles", () => {
  test("STATUS 200: responds with an array of all the article objects, by default sorted by date in descending order ", () => {
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
  test("STATUS 200: responds with an array of all the article objects in ascending order when order is specified", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toBeSortedBy("created_at", {
          descending: false,
        });
      });
  });

  test("STATUS 200: responds with an array of all the article object with the specified topic property", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((response) => {
        const { articles } = response.body;
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });

  test("STATUS 200: responds with an array of articles sorted by the specified column", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("author", { descending: true });
      });
  });
  test("STATUS 200: responds with an array of articles with the specified topic, order and column", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=author&order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("author", { descending: false });
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
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
          comment_count: 11,
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

describe("PATCH /api/articles/:article_id", () => {
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
  test("STATUS 200 - decrements the given articles' votes and returns it", () => {
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

describe("DELETE /api/articles/:article_id", () => {
  test("STATUS 204: responds with no content when article is successfully deleted ", () => {
    return request(app).delete("/api/articles/5").expect(204);
  });
  test("STATUS 400: invalid article ID", () => {
    return request(app)
      .delete("/api/articles/1Nonsense")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request - invalid data type");
      });
  });
  test("STATUS 404: valid but non-existent article ID ", () => {
    return request(app)
      .delete("/api/articles/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("ID not found");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("STATUS 200 - increments the given comments' votes and returns it", () => {
    const newVote = { inc_votes: 10 };
    return request(app)
      .patch("/api/comments/1")
      .send(newVote)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: 1,
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          article_id: 9,
          author: "butter_bridge",
          votes: 26,
          created_at: expect.any(String),
        });
      });
  });
  test("STATUS 200 - increments the given comments' votes and returns it", () => {
    const newVote = { inc_votes: -10 };
    return request(app)
      .patch("/api/comments/1")
      .send(newVote)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: 1,
          body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
          article_id: 9,
          author: "butter_bridge",
          votes: 6,
          created_at: expect.any(String),
        });
      });
  });
  test("STATUS 400: incomplete request body ", () => {
    const newVote = {};
    return request(app)
      .patch("/api/comments/1")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Invalid post body");
      });
  });
  test("STATUS 400: invalid votes format ", () => {
    const newVote = { inc_votes: "five" };
    return request(app)
      .patch("/api/comments/1")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request - invalid data type");
      });
  });
  test("STATUS 400: invalid comment ID", () => {
    const newVote = { inc_votes: 5 };
    return request(app)
      .patch("/api/articles/25Nonsense")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request - invalid data type");
      });
  });
  test("STATUS 404: valid but non-existent comment ID", () => {
    const newVote = { inc_votes: 5 };
    return request(app)
      .patch("/api/comments/99999")
      .send(newVote)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment ID not found");
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
