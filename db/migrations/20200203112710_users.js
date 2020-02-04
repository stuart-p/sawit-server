//migration methods for table - USERS

exports.up = function(knex) {
  // console.log("creating USERS table");
  return knex.schema.createTable("users", usersTable => {
    usersTable
      .string("username")
      .primary()
      .unique()
      .notNullable();
    usersTable.string("avatar_url");
    usersTable.string("name");
  });
};

exports.down = function(knex) {
  // console.log("destroying USERS table");
  return knex.schema.dropTable("users");
};
