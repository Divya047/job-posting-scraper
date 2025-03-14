import express, { Request, Response } from "express";
import client from "../database.js";

const companyRouter = express.Router();
companyRouter.post("/", async (req: Request, res: Response) => {
  const { name, url, classOfJobTitle } = req.body;
  try {
    const response = await client.query(
      'INSERT INTO companies ("Name", "Url", "ClassOfJobTitle") VALUES ($1, $2, $3)',
      [name, url, classOfJobTitle]
    );
    res.json(response);
  } catch (e) {
    console.log(e);
  }
});

companyRouter.delete("/", async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const response = await client.query(
      'DELETE FROM companies WHERE "Name" = $1',
      [name]
    );
    res.json(response);
  } catch (e) {
    console.log(e);
  }
});

companyRouter.put("/url", async (req: Request, res: Response) => {
  const { name, url } = req.body;
  try {
    const response = await client.query(
      'UPDATE companies SET "Url" = $1 WHERE "Name" = $2',
      [url, name]
    );
    res.json(response);
  } catch (e) {
    console.log(e);
  }
});

companyRouter.put("/class", async (req: Request, res: Response) => {
  const { name, classOfJobTitle } = req.body;
  try {
    const response = await client.query(
      'UPDATE companies SET "ClassOfJobTitle" = $1 WHERE "Name" = $2',
      [classOfJobTitle, name]
    );
    res.json(response);
  } catch (e) {
    console.log(e);
  }
});

companyRouter.get("/", async (req, res) => {
  let companies = undefined;
  try {
    const res = await client.query("SELECT * FROM companies");
    companies = res.rows;
  } catch (e) {
    console.log(e);
  }
  if (companies) {
    res.json(companies);
  } else {
    res.json([]);
  }
});

export { companyRouter };
