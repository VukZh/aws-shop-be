import knex from "knex";
import * as process from "process";

const {PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD} = process.env;

const pgOptions = {
  host: PG_HOST,
  post: PG_PORT,
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
};

export default knex({
  client: 'pg',
  connection: pgOptions,
})