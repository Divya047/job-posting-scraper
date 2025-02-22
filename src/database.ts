import pg from "pg";
const { Client } = pg;

const config = {
  user: process.env.DATABASE_USER_NAME,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  database: "defaultdb",
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.DATABASE_CERTIFICATE,
  },
};
export default new Client(config);
