import express from "express";
import { companyRouter } from "./router/company.js";
import { postingsRouter } from "./router/postings.js";
import client from "./database.js";
import "dotenv/config";
const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to the database when the server starts
client
  .connect()
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });

app.use("/company", companyRouter);

app.use("/postings", postingsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
