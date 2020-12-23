import Knex from 'knex'

export async function up(knex: Knex) {
  return knex.schema.createTable('mails', table => {
    table.increments('id').primary();
    table.string('message').notNullable();
    table.string('from').notNullable();
    table.string('phone').notNullable();
    table.string('name').notNullable();
    table.dateTime('time').notNullable();
  })
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('mails');
}