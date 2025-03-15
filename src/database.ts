import pg from "pg";
const { Client } = pg;

let certificate = "";
if (process.env.DATABASE_CERTIFICATE !== undefined) {
  const certBase64 = process.env.DATABASE_CERTIFICATE;
  certificate = Buffer.from(certBase64, "base64").toString("utf8");
}
const config = {
  user: process.env.DATABASE_USER_NAME,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  database: "defaultdb",
  ssl: {
    rejectUnauthorized: true,
    ca: certificate,
  },
};
export default new Client(config);
