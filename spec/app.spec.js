process.env.NODE_ENV = "test";
const { expect } = require("chai");
const connection = require("../db/connection");
const server = require("../server");
const request = require("supertest");

after(() => {
  connection.destroy();
});

beforeEach(() => {
  return connection.seed.run().then(() => {
    // console.log("database seeded! Database: " + process.env.NODE_ENV);
  });
});

describe("/api", () => {
  describe("/api/topics", () => {
    it("GET: returns 200 and returns object of key topics", () => {
      return request(server)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.keys("topics");
          body.topics.forEach(topic => {
            expect(topic).to.have.keys("slug", "description");
          });
        });
    });
  });
  it("PUT PATCH PUSH DELETE return 405 method not allowed", () => {
    const invalidMethods = ["patch", "put", "delete", "post"];
    const methodPromises = invalidMethods.map(method => {
      return request(server)
        [method]("/api/topics")
        .expect(405)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("method not allowed");
        });
    });
    return Promise.all(methodPromises);
  });
  describe("/api/users", () => {
    it("GET PUSH POST PATCH DELETE return 405 method not allowed", () => {
      const invalidMethods = ["get", "patch", "put", "post", "delete"];
      const methodPromises = invalidMethods.map(method => {
        return request(server)
          [method]("/api/users")
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("method not allowed");
          });
      });
      return Promise.all(methodPromises);
    });
    describe("/api/users/:username", () => {
      it("GET: 200 when username exists", () => {
        return request(server)
          .get("/api/users/butter_bridge")
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.keys("user");
            expect(body.user).to.have.keys("username", "avatar_url", "name");
          });
      });
      it("GET: 404 when username is valid but doesnt exist", () => {
        return request(server)
          .get("/api/users/non_existant_user")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("username not found");
          });
      });
      it("PUT PATCH DELETE POST return 405 on api/users/:username endpoint", () => {
        const invalidMethods = ["patch", "put", "delete", "post"];
        const body = {
          username: "icellusedkars",
          name: "sam",
          avatar_url:
            "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4"
        };
        const methodPromises = invalidMethods.map(method => {
          return request(server)
            [method]("/api/users/butter_bridge")
            .send(body)
            .expect(405)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("method not allowed");
            });
        });
        return Promise.all(methodPromises);
      });
    });
  });
  describe("/api/articles", () => {
    describe("/api/articles/:article_id", () => {
      it("GET: 200. returns a specific article when passed a valid article_id", () => {
        return request(server)
          .get("/api/articles/4")
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.keys("article");
            expect(body.article).to.have.keys(
              "article_id",
              "title",
              "body",
              "votes",
              "topic",
              "author",
              "created_at"
            );
            expect(body.article.article_id).to.equal(4);
          });
      });
      it("GET: 404 returns not found when passed a valid but non existant article_id", () => {
        return request(server)
          .get("/api/articles/999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("article not found");
          });
      });
      it("GET: 400 returns bad request when passed an invalid article_id", () => {
        return request(server)
          .get("/api/articles/INVALIDREQUEST")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("bad request");
          });
      });
    });
  });
});
