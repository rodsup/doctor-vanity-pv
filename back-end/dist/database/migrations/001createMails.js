"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    return knex.schema.createTable('mails', table => {
        table.increments('id').primary();
        table.string('message').notNullable();
        table.string('from').notNullable();
        table.string('phone').notNullable();
        table.string('name').notNullable();
        table.dateTime('time').notNullable();
    });
}
exports.up = up;
async function down(knex) {
    return knex.schema.dropTable('mails');
}
exports.down = down;
