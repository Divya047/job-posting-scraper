import express, { Request, Response } from "express";
import client from "../database.js";
import { verifyToken } from "../middleware.js";

const companyRouter = express.Router();

companyRouter.post("/", verifyToken, async (req: Request, res: Response) => {
  const { name, url, classOfJobTitle } = req.body;
  try {
    if (!name || !url || !classOfJobTitle) {
      res.status(400).json({ error: "Missing required fields" });
    }
    const response = await client.query(
      'INSERT INTO companies ("Name", "Url", "ClassOfJobTitle") VALUES ($1, $2, $3)',
      [name, url, classOfJobTitle]
    );
    res.status(201).json(response);
  } catch (e) {
    console.error("Error creating company:", e);
    res.status(500).json({ error: "Failed to create company" });
  }
});

companyRouter.delete("/", verifyToken, async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    if (!name) {
      res.status(400).json({ error: "Company name is required" });
    }
    const response = await client.query(
      'DELETE FROM companies WHERE "Name" = $1',
      [name]
    );
    if (response.rowCount === 0) {
      res.status(404).json({ error: "Company not found" });
    }
    res.json({ message: "Company deleted successfully" });
  } catch (e) {
    console.error("Error deleting company:", e);
    res.status(500).json({ error: "Failed to delete company" });
  }
});

companyRouter.put("/url", verifyToken, async (req: Request, res: Response) => {
  const { name, url } = req.body;
  try {
    if (!name || !url) {
      res.status(400).json({ error: "Name and URL are required" });
    }
    const response = await client.query(
      'UPDATE companies SET "Url" = $1 WHERE "Name" = $2',
      [url, name]
    );
    if (response.rowCount === 0) {
      res.status(404).json({ error: "Company not found" });
    }
    res.json({ message: "URL updated successfully" });
  } catch (e) {
    console.error("Error updating company URL:", e);
    res.status(500).json({ error: "Failed to update URL" });
  }
});

companyRouter.put(
  "/class",
  verifyToken,
  async (req: Request, res: Response) => {
    const { name, classOfJobTitle } = req.body;
    try {
      if (!name || !classOfJobTitle) {
        res.status(400).json({ error: "Name and class are required" });
      }
      const response = await client.query(
        'UPDATE companies SET "ClassOfJobTitle" = $1 WHERE "Name" = $2',
        [classOfJobTitle, name]
      );
      if (response.rowCount === 0) {
        res.status(404).json({ error: "Company not found" });
      }
      res.json({ message: "Class updated successfully" });
    } catch (e) {
      console.error("Error updating job title class:", e);
      res.status(500).json({ error: "Failed to update class" });
    }
  }
);

companyRouter.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const response = await client.query("SELECT * FROM companies");
    res.json(response.rows || []);
  } catch (e) {
    console.error("Error fetching companies:", e);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

export { companyRouter };
