process.env.NODE_ENV = "test";
const chai = require("chai");
const expect = chai.expect;
const connection = require("../db/connection");
const server = require("../server");
const request = require("supertest");

chai.use(require("sams-chai-sorted"));
after(() => {
  connection.destroy();
});

beforeEach(() => {
  return connection.seed.run().then(() => {});
});

describe("/api", () => {
  it("GET: 200 returns and JSON of all valid api endpoints", () => {
    return request(server)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).to.have.keys("endpoints");
      });
  });
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
    it("POST: 200 returns topic when passed valid body", () => {
      const input = {
        slug: "test",
        description: "This is a test topic added during testing"
      };
      return request(server)
        .post("/api/topics")
        .send(input)
        .expect(201)
        .then(({ body }) => {
          expect(body).to.have.keys("topic");
          expect(body.topic).to.have.keys("slug", "description");
        });
    });
    it("POST: 400 return bad request when passed an incomplete body", () => {
      const input = {
        slug: "test"
      };
      return request(server)
        .post("/api/topics")
        .send(input)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("bad request - incomplete data");
        });
    });
    it("POSt: 400 returns bad request when passed a pre-existing slug", () => {
      const input = {
        slug: "paper",
        description: "this slug should already exist"
      };
      return request(server)
        .post("/api/topics")
        .send(input)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("bad request - key already exists");
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
  });
  describe("/api/users", () => {
    it("GET: 200 returns a list of all users", () => {
      return request(server)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.keys("users");
          body.users.forEach(user => {
            expect(user).to.have.keys("username", "avatar_url", "name");
          });
        });
    });
    it("POST: 201 returns new user when passed valid body", () => {
      const input = {
        username: "test",
        avatar_url: "www.test.com",
        name: "Mr Test"
      };
      return request(server)
        .post("/api/users")
        .send(input)
        .expect(201)
        .then(({ body }) => {
          expect(body).to.have.keys("user");
          expect(body.user).to.have.keys("username", "avatar_url", "name");
        });
    });
    it("POST: 400 bad request when passed incomplete body", () => {
      const input = {
        username: "test",
        name: "Mr Test"
      };
      return request(server)
        .post("/api/users")
        .send(input)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("bad request - incomplete information");
        });
    });
    it("POST: 400 bad request when passed a username that already exists", () => {
      const input = {
        username: "lurker",
        avatar_url: "www.test.com",

        name: "Mr Test"
      };
      return request(server)
        .post("/api/users")
        .send(input)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("bad request - key already exists");
        });
    });
    it("GET PUSH PATCH DELETE return 405 method not allowed", () => {
      const invalidMethods = ["get", "patch", "put", "delete"];
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
    it("GET: 200 returns an object containing an array of all articles", () => {
      return request(server)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.any.keys("articles");
          body.articles.forEach(article => {
            expect(article).to.have.keys(
              "author",
              "title",
              "article_id",
              "topic",
              "created_at",
              "votes",
              "comment_count"
            );
          });
        });
    });
    it("GET: 200 returns articles with an appended comment_count parameter, which matches with the comments for an article", () => {
      return request(server)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0].comment_count).to.equal(13);
        });
    });
    it("GET: 200 defaults to sorted by date", () => {
      return request(server)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.sortedBy("created_at", {
            descending: true
          });
        });
    });
    it("GET: 200 defaults to ordered descending", () => {
      return request(server)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.sortedBy("created_at", {
            descending: true
          });
        });
    });
    it("GET:200 passing valid sort_by query sorts the data correctly", () => {
      const validSorts = [
        "votes",
        "author",
        "title",
        "topic",
        "article_id",
        "created_at",
        "comment_count"
      ];

      const validQuery = validSorts.map(query => {
        return request(server)
          .get(`/api/articles?sort_by=${query}`)
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.sortedBy(query, {
              descending: true
            });
          });
      });

      return Promise.all(validQuery);
    });
    it("GET: 200 passing valid order query orders the data correctly", () => {
      const validOrders = ["asc", "desc"];

      const validQuery = validOrders.map(query => {
        return request(server)
          .get(`/api/articles?order=${query}`)
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.sortedBy("created_at", {
              descending: query === "desc" ? true : false
            });
          });
      });

      return Promise.all(validQuery);
    });
    it("GET: 200 passing valid author query returns articles filtered by author", () => {
      return request(server)
        .get("/api/articles?author=butter_bridge")
        .expect(200)
        .then(({ body }) => {
          body.articles.forEach(article => {
            expect(article.author).to.equal("butter_bridge");
          });
        });
    });
    it("GET:200 passing valid topic query returns articles filtered by topics", () => {
      return request(server)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body }) => {
          body.articles.forEach(article => {
            expect(article.topic).to.equal("mitch");
          });
        });
    });
    it("GET:200 passing valid author filter returns an empty array if the author hasnt posted anything yet", () => {
      return request(server)
        .get("/api/articles?author=lurker")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an("array");
          expect(body.articles.length).to.equal(0);
        });
    });
    it("GET:200 passing valid topic filter returns an empty array if the topic hasnt been posted to yet", () => {
      return request(server)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an("array");
          expect(body.articles.length).to.equal(0);
        });
    });
    it("GET:200 passing multiple valid queries returns valid articles", () => {
      return request(server)
        .get("/api/articles?topic=mitch&&sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.sortedBy("votes", { descending: true });
          body.articles.forEach(article => {
            expect(article.topic).to.equal("mitch");
          });
        });
    });
    it("GET:200 returns a default of first 10 articles", () => {
      return request(server)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).to.equal(10);
        });
    });
    it("GET:200 passing a limit query sets the returned page limit", () => {
      return request(server)
        .get("/api/articles?limit=8")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles.length).to.equal(8);
        });
    });
    it("GET: 200 page query sets the page number of the returned results", () => {
      return request(server)
        .get("/api/articles?p=2")
        .expect(200)
        .then(({ body }) => {
          body.articles.forEach((article, increment) => {
            expect(article.article_id).to.equal(10 + 1 + increment);
          });
        });
    });
    it("GET:200 page query and limit work together to return the correct result", () => {
      const page = 4;
      const pageLimit = 2;
      return request(server)
        .get("/api/articles?p=4&&limit=2")
        .expect(200)
        .then(({ body }) => {
          body.articles.forEach((article, increment) => {
            expect(article.article_id).to.equal(
              (page - 1) * pageLimit + 1 + increment
            );
          });
        });
    });
    it("GET:200 returns an object with a total_count key for all articles that match the query", () => {
      return request(server)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.any.keys("total_count");
          expect(body.total_count).to.equal(12);
        });
    });
    it("GET: 400 bad request if sent a page number <=0 ", () => {
      return request(server)
        .get("/api/articles?p=-999")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("bad request - invalid page number");
        });
    });
    it("GET: 400 bad request if sent a page limit <=0", () => {
      return request(server)
        .get("/api/articles?limit=-999")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("bad request - invalid page limit");
        });
    });
    it("GET: 400 bad request if sent invalid page number", () => {
      return request(server)
        .get("/api/articles?p=INVALID")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("bad request");
        });
    });
    it("GET: 400 bad request if sent invalid page limit", () => {
      return request(server)
        .get("/api/articles?limit=INVALID")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("bad request");
        });
    });
    it("GET: non-existant queries are ignored", () => {
      return request(server)
        .get("/api/articles?invalid=45")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.sortedBy("created_at", {
            descending: true
          });
        });
    });
    it("GET: 400 returns bad request when pass an invalid sort_by request", () => {
      return request(server)
        .get("/api/articles?sort_by=invalid")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("bad request - query incorrectly formatted");
        });
    });
    it("GET: 400 returns bad request when passed an invalid order request", () => {
      return request(server)
        .get("/api/articles?order=invalid")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("bad request - query incorrectly formatted");
        });
    });
    it("GET: 404 returns not found when passed an author filter that is not in the database", () => {
      return request(server)
        .get("/api/articles?author=INVALID")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("username not found");
        });
    });
    it("GET:404 returns not found when passed a topic filter that is not in the database", () => {
      return request(server)
        .get("/api/articles?topic=INVALID")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("topic not found");
        });
    });
    it("POST: 200 returns posted article when passed valid body data", () => {
      const input = {
        title: "test article",
        body: "This is a test article generated as part of the test suite",
        author: "lurker",
        topic: "paper"
      };
      return request(server)
        .post("/api/articles")
        .send(input)
        .expect(201)
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
          expect(body.article.votes).to.equal(0);
          expect(body.article.author).to.equal("lurker");
          expect(body.article.title).to.equal("test article");
          expect(body.article.topic).to.equal("paper");
        });
    });
    it("POST: 404 returns bad request when passed a username in the body that does not exist", () => {
      const input = {
        title: "test article",
        body: "This is a test article generated as part of the test suite",
        author: "INVALID",
        topic: "paper"
      };
      return request(server)
        .post("/api/articles")
        .send(input)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("not found");
        });
    });
    it("POST: 404 returns not found when passed a topic that does not exist", () => {
      const input = {
        title: "test article",
        body: "This is a test article generated as part of the test suite",
        author: "lurker",
        topic: "INVALID"
      };
      return request(server)
        .post("/api/articles")
        .send(input)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("not found");
        });
    });
    it("POST: 400 returns bad request when passed a body that doesnt contain all requried keys", () => {
      const input = {
        title: "test article",
        body: "This is a test article generated as part of the test suite",
        author: "lurker"
      };
      return request(server)
        .post("/api/articles")
        .send(input)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).to.equal("bad request - not enough data provided");
        });
    });
    it("PUT PATCH DELETE returns 405 on api/articles end point", () => {
      const invalidMethods = ["patch", "put", "delete"];
      const methodPromises = invalidMethods.map(method => {
        return request(server)
          [method]("/api/articles")
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("method not allowed");
          });
      });
      return Promise.all(methodPromises);
    });
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
              "created_at",
              "comment_count"
            );
            expect(body.article.article_id).to.equal(4);
          });
      });
      it("GET:200 a valid get request returns a count of the comments associated with an article, appended to the article object", () => {
        return request(server)
          .get("/api/articles/5")
          .expect(200)
          .then(({ body }) => {
            expect(body.article.comment_count).to.equal(2);
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
      it("PATCH: 200 returns updated article when passed a valid article_id and body data", () => {
        const voteIncrement = 2;
        const input = {
          inc_votes: voteIncrement
        };
        return request(server)
          .patch("/api/articles/4")
          .send(input)
          .expect(200)
          .then(({ body }) => {
            expect(body.article.votes).to.equal(voteIncrement);
          })
          .then(() => {
            return request(server)
              .patch("/api/articles/4")
              .send(input)
              .expect(200);
          })
          .then(({ body }) => {
            expect(body.article.votes).to.equal(voteIncrement + voteIncrement);
          });
      });
      it("PATCH: 200 returns original article when passed a valid article_id but no vote incrememntor", () => {
        const input = {
          invalid_key: 45
        };
        return request(server)
          .patch("/api/articles/4")
          .send(input)
          .expect(200)
          .then(({ body }) => {
            expect(body.article.votes).to.equal(0);
          });
      });
      it("PATCH: 404 returns not found when passed a valid article_id that doesnt exist", () => {
        const input = {
          inc_votes: 3
        };
        return request(server)
          .patch("/api/articles/999")
          .send(input)
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("article not found");
          });
      });
      it("PATCH: 400 returns bad request when passed an invalid article_id", () => {
        const input = {
          inc_votes: 3
        };
        return request(server)
          .patch("/api/articles/INVALID")
          .send(input)
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("bad request");
          });
      });
      it("PATCH: 406 returns not acceptable when passed a valid article_id but a non-integer vote incrememt", () => {
        const input = {
          inc_votes: "INVALID"
        };
        return request(server)
          .patch("/api/articles/4")
          .send(input)
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("bad request");
          });
      });
      it("PATCH: 200 returns valid data when passed a valid article_id and a body that contains additional fields", () => {
        const input = {
          inc_votes: 2,
          random_field: "INVALID"
        };
        return request(server)
          .patch("/api/articles/4")
          .send(input)
          .expect(200)
          .then(({ body }) => {
            expect(body.article.votes).to.equal(2);
          });
      });
      it("DELETE: 204 no return when passed a valid article_id", () => {
        return request(server)
          .delete("/api/articles/1")
          .expect(204);
      });
      it("DELETE: 404 returns not found when passed a valid but non existant article_id", () => {
        return request(server)
          .delete("/api/articles/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("article not found");
          });
      });
      it("DELETE: 400 returns bad request when passed an invalid article_id", () => {
        return request(server)
          .delete("/api/articles/INVALID")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("bad request");
          });
      });
      it("PUT, POST: 405 returns method not allowed", () => {
        const invalidMethods = ["put", "post"];
        const methodPromises = invalidMethods.map(method => {
          return request(server)
            [method]("/api/articles/4")
            .expect(405)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("method not allowed");
            });
        });
        return Promise.all(methodPromises);
      });
      describe("/api/articles/:article_id/comments", () => {
        it("POST: 201 returns the posted comment when passed a valid article_id and body containing a valid username and body text", () => {
          const input = {
            username: "butter_bridge",
            body:
              "this is a comment posted as per post comment to article_id test"
          };
          return request(server)
            .post("/api/articles/1/comments")
            .send(input)
            .expect(201)
            .then(({ body }) => {
              expect(body).to.have.keys("comment");
              expect(body.comment).to.have.keys(
                "comment_id",
                "author",
                "article_id",
                "votes",
                "created_at",
                "body"
              );
              expect(body.comment.votes).to.equal(0);
              expect(body.comment.author).to.equal("butter_bridge");
              expect(body.comment.article_id).to.equal(1);
              expect(body.comment.body).to.equal(
                "this is a comment posted as per post comment to article_id test"
              );
            });
        });
        it("POST: 404 returns not found when a valid but non-existant article_id is passed", () => {
          const input = {
            username: "butter_bridge",
            body:
              "this is a comment posted as per post comment to article_id test"
          };
          return request(server)
            .post("/api/articles/999/comments")
            .send(input)
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("not found");
            });
        });
        it("POST: 400 returns bad request when passed an article_id that is invalid", () => {
          const input = {
            username: "butter_bridge",
            body:
              "this is a comment posted as per post comment to article_id test"
          };
          return request(server)
            .post("/api/articles/INVALID/comments")
            .send(input)
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("bad request");
            });
        });
        it("POST: 400 returns bad request when passed a username in the body that does not exist", () => {
          const input = {
            username: "INVALID",
            body:
              "this is a comment posted as per post comment to article_id test"
          };
          return request(server)
            .post("/api/articles/1/comments")
            .send(input)
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("not found");
            });
        });
        it("POST: 400 returns bad request when passed a body that doenst contain all required keys", () => {
          let input = {
            username: "butter_bridge"
          };
          inputTwo = {
            body:
              "this is a comment posted as per post comment to article_id test"
          };
          return request(server)
            .post("/api/articles/1/comments")
            .send(input)
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("bad request - not enough data provided");
            })
            .then(() => {
              return request(server)
                .post("/api/articles/1/comments")
                .send(inputTwo)
                .expect(400);
            })
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("bad request - not enough data provided");
            });
        });

        it("GET: 200 returns an object with key comments and value array of comments when passed a valid article_id", () => {
          return request(server)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
              expect(body).to.have.any.keys("comments");
              expect(body.comments).to.be.an("array");
              body.comments.forEach(comment => {
                expect(comment).to.have.keys(
                  "comment_id",
                  "votes",
                  "created_at",
                  "author",
                  "body"
                );
              });
            });
        });
        it("GET: 404 returns not found when passed a valid but not present article_id", () => {
          return request(server)
            .get("/api/articles/999/comments")
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("article not found");
            });
        });
        it("GET: 200 returns an empty array when passed a valid but empty article_id", () => {
          return request(server)
            .get("/api/articles/4/comments")
            .expect(200)
            .then(({ body }) => {
              expect(body).to.have.any.keys("comments");
              expect(body.comments.length).to.equal(0);
            });
        });
        it("GET: default sorting is by created_at,  descending", () => {
          return request(server)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
              expect(body.comments).to.be.sortedBy("created_at", {
                descending: true
              });
            });
        });
        it("GET: comments are sorted by valid column when sort_by query is used", () => {
          const validSorts = ["votes", "comment_id", "created_at", "author"];

          const validQuery = validSorts.map(query => {
            return request(server)
              .get(`/api/articles/1/comments?sort_by=${query}`)
              .expect(200)
              .then(({ body }) => {
                expect(body.comments).to.be.sortedBy(query, {
                  descending: true
                });
              });
          });

          return Promise.all(validQuery);
        });
        it("GET: comments are ordered ascending or descending when a valid order query is used", () => {
          const validOrders = ["asc", "desc"];

          const validQuery = validOrders.map(query => {
            return request(server)
              .get(`/api/articles/1/comments?order=${query}`)
              .expect(200)
              .then(({ body }) => {
                expect(body.comments).to.be.sortedBy("created_at", {
                  descending: query === "desc" ? true : false
                });
              });
          });
        });
        it("GET:200 returns a default of first 10 articles", () => {
          return request(server)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
              expect(body.comments.length).to.equal(10);
            });
        });
        it("GET:200 passing a limit query sets the returned page limit", () => {
          return request(server)
            .get("/api/articles/1/comments?limit=8")
            .expect(200)
            .then(({ body }) => {
              expect(body.comments.length).to.equal(8);
            });
        });
        it("GET: 200 page query sets the page number of the returned results", () => {
          return request(server)
            .get("/api/articles/1/comments?p=2")
            .expect(200)
            .then(({ body }) => {
              expect(body.comments.length).to.equal(3);
            });
        });
        it("GET:200 page query and limit work together to return the correct result", () => {
          const page = 4;
          const pageLimit = 2;
          return request(server)
            .get("/api/articles/1/comments?p=4&&limit=2")
            .expect(200)
            .then(({ body }) => {
              expect(body.comments.length).to.equal(2);
            });
        });
        it("GET:200 returns an object with a total_count key for all articles that match the query", () => {
          return request(server)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
              expect(body).to.have.any.keys("total_count");
              expect(body.total_count).to.equal(13);
            });
        });
        it("GET: 400 bad request if sent a page number <=0 ", () => {
          return request(server)
            .get("/api/articles/1/comments?p=-999")
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("bad request - invalid page number");
            });
        });
        it("GET: 400 bad request if sent a page limit <=0", () => {
          return request(server)
            .get("/api/articles/1/comments?limit=-999")
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("bad request - invalid page limit");
            });
        });
        it("GET: 400 bad request if sent invalid page number", () => {
          return request(server)
            .get("/api/articles/1/comments?p=INVALID")
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("bad request");
            });
        });
        it("GET: 400 bad request if sent invalid page limit", () => {
          return request(server)
            .get("/api/articles/1/comments?limit=INVALID")
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("bad request");
            });
        });
        it("GET: 400 returns bad request when passed a query with an invalid parameter", () => {
          return request(server)
            .get("/api/articles/1/comments?sort_by=invalid")
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("bad request - query incorrectly formatted");
            });
        });
        it("PATCH, PUT, DELETE: 405 returns invalid method ", () => {
          const invalidMethods = ["patch", "put", "delete"];
          const methodPromises = invalidMethods.map(method => {
            return request(server)
              [method]("/api/articles/1/comments")
              .expect(405)
              .then(({ body: { msg } }) => {
                expect(msg).to.equal("method not allowed");
              });
          });
          return Promise.all(methodPromises);
        });
      });
    });
  });
  describe("/api/comments", () => {
    describe("/api/comments/:comment_id", () => {
      it("PATCH: 200 returns updated comment when passed a valid comment_id and body data", () => {
        const voteIncrement = 2;
        const input = {
          inc_votes: voteIncrement
        };
        return request(server)
          .patch("/api/comments/5")
          .send(input)
          .expect(200)
          .then(({ body }) => {
            expect(body.comment.votes).to.equal(voteIncrement);
          })
          .then(() => {
            return request(server)
              .patch("/api/comments/5")
              .send(input)
              .expect(200);
          })
          .then(({ body }) => {
            expect(body.comment.votes).to.equal(voteIncrement + voteIncrement);
          });
      });
      it("PATCH: 200 returns original comment when passed a valid comment_id but no incremementor", () => {
        const input = {
          invalid_key: 45
        };
        return request(server)
          .patch("/api/comments/5")
          .send(input)
          .expect(200)
          .then(({ body }) => {
            expect(body.comment.votes).to.equal(0);
          });
      });
      it("PATCH: 404 returns not found when passed a valid comment_id that doesnt exist", () => {
        const input = {
          inc_votes: 3
        };
        return request(server)
          .patch("/api/comments/999")
          .send(input)
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("comment not found");
          });
      });
      it("PATCH: 400 returns bad request when passed an invalid comment_id", () => {
        const input = {
          inc_votes: 3
        };
        return request(server)
          .patch("/api/comments/INVALID")
          .send(input)
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("bad request");
          });
      });
      it("PATCH: 406 returns not acceptable when passed a valid article_id but a non-integer vote incremenet", () => {
        const input = {
          inc_votes: "INVALID"
        };
        return request(server)
          .patch("/api/comments/5")
          .send(input)
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("bad request");
          });
      });
      it("PATCH: 200 returns valid data when passed a valid comment_id and a body that contains additional fields", () => {
        const input = {
          inc_votes: 2,
          random_field: "INVALID"
        };
        return request(server)
          .patch("/api/comments/5")
          .send(input)
          .expect(200)
          .then(({ body }) => {
            expect(body.comment.votes).to.equal(2);
          });
      });
      it("DELETE: 204 returns no content when passed a valid comment_id", () => {
        return request(server)
          .delete("/api/comments/5")
          .expect(204);
      });
      it("DELETE: 404 returns not found when passed a valid but non existant comment_id", () => {
        return request(server)
          .delete("/api/comments/99999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("comment not found");
          });
      });
      it("DELETE: 400 returns bad request when passed an invalid comment_id", () => {
        return request(server)
          .delete("/api/comments/INVALID")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("bad request");
          });
      });
      it("GET PUT POST: 405 returns method not allowed", () => {
        const invalidMethods = ["get", "put", "post"];
        const methodPromises = invalidMethods.map(method => {
          return request(server)
            [method]("/api/comments/5")
            .expect(405)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("method not allowed");
            });
        });
        return Promise.all(methodPromises);
      });
    });
  });
});
