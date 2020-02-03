//migration methods for table - TOPICS

exports.up = function(knex) {
  console.log("creating TOPICS table");
  return knex.schema.createTable("topics", topicsTable => {
    topicsTable
      .string("slug")
      .primary()
      .unique();
    topicsTable.string("description").notNullable();
  });
};

exports.down = function(knex) {
  console.log("destoyring TOPICS table");
  return knex.schema.dropTable("topics");
};
