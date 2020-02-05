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
    it("GET: 200 returns an object containing an array of all articles", () => {
      return request(server)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.keys("articles");
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
    it("PUT PATCH DELETE POST returns 405 on api/articles end point", () => {
      const invalidMethods = ["patch", "put", "delete", "post"];
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
            // console.log(body);
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
            // console.log(body);
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
            expect(body.updatedArticle.votes).to.equal(voteIncrement);
          })
          .then(() => {
            return request(server)
              .patch("/api/articles/4")
              .send(input)
              .expect(200);
          })
          .then(({ body }) => {
            expect(body.updatedArticle.votes).to.equal(
              voteIncrement + voteIncrement
            );
          });
      });
      it("PATCH: 406 returns bad request when passed a valid article_id but no vote incrememntor", () => {
        const input = {
          invalid_key: 45
        };
        return request(server)
          .patch("/api/articles/4")
          .send(input)
          .expect(406)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("bad request - not enough data provided");
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
            expect(body.updatedArticle.votes).to.equal(2);
          });
      });
      it("PUT, POST, DELETE: 405 returns method not allowed", () => {
        const invalidMethods = ["put", "delete", "post"];
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
              // console.log(body);
              expect(body).to.have.keys("comment");
              expect(body.comment).to.have.keys(
                "comments_id",
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
            .expect(406)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal("bad request - not enough data provided");
            })
            .then(() => {
              return request(server)
                .post("/api/articles/1/comments")
                .send(inputTwo)
                .expect(406);
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
              expect(body).to.have.keys("comments");
              expect(body.comments).to.be.an("array");
              body.comments.forEach(comment => {
                expect(comment).to.have.keys(
                  "comments_id",
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
              expect(body).to.have.keys("comments");
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
          const validSorts = ["votes", "comments_id", "created_at"];

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

          return Promise.all(validQuery);
        });
        it("GET: non-existant queries are ignored", () => {
          return request(server)
            .get("/api/articles/1/comments?invalid=votes")
            .expect(200)
            .then(({ body }) => {
              expect(body.comments).to.be.sortedBy("created_at", {
                descending: true
              });
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
    describe("/api/comments/:comments_id", () => {
      it("PATCH: 200 returns updated comment when passed a valid comments_id and body data", () => {
        const voteIncrement = 2;
        const input = {
          inc_votes: voteIncrement
        };
        return request(server)
          .patch("/api/comments/5")
          .send(input)
          .expect(200)
          .then(({ body }) => {
            expect(body.updatedComment.votes).to.equal(voteIncrement);
          })
          .then(() => {
            return request(server)
              .patch("/api/comments/5")
              .send(input)
              .expect(200);
          })
          .then(({ body }) => {
            expect(body.updatedComment.votes).to.equal(
              voteIncrement + voteIncrement
            );
          });
      });
      it("PATCH: 406 returns bad request when passed a valid comments_id but no incremementor", () => {
        const input = {
          invalid_key: 45
        };
        return request(server)
          .patch("/api/comments/5")
          .send(input)
          .expect(406)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal("bad request - not enough data provided");
          });
      });
      it("PATCH: 404 returns not found when passed a valid comments_id that doesnt exist", () => {
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
            expect(body.updatedComment.votes).to.equal(2);
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
