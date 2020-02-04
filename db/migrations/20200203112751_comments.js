//migration methods for table - COMMENTS

exports.up = function(knex) {
  // console.log("creating COMMENTS table");
  return knex.schema.createTable("comments", commentsTable => {
    commentsTable.increments("comments_id").primary();
    commentsTable.string("author").references("users.username");
    commentsTable.integer("article_id").references("articles.article_id");
    commentsTable.integer("votes").defaultTo(0);
    commentsTable.timestamp("created_at").defaultTo(knex.fn.now());
    commentsTable.string("body", 8000);
  });
};

exports.down = function(knex) {
  // console.log("destroying COMMENTS table");
  return knex.schema.dropTable("comments");
};
