import express, { Request, Response } from "express";
import client from "../database.js";
import { companyPosts, Company } from "../types.js";
import { savePostings, scrap } from "../helper-functions.js";
import { verifyToken } from "../middleware.js";
// Temporary require declaration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const require: any;
const Push = require("pushover-notifications");
const postingsRouter = express.Router();

const push = new Push({
  user: process.env.PUSHOVER_USER,
  token: process.env.PUSHOVER_TOKEN,
});

postingsRouter.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const companies = await client.query("SELECT * FROM companies");
    const jobsPosted: companyPosts = {};
    const newPostings: companyPosts = {};
    await Promise.all(
      companies.rows.map(async (company: Company) => {
        try {
          const posts = await scrap(company.Url, company.ClassOfJobTitle);
          const oldPosts = company.Postings;
          const newPosts = posts.filter((post) => !oldPosts.includes(post));
          newPostings[company.Name] = newPosts;
          jobsPosted[company.Name] = posts;
        } catch (error) {
          console.error(
            `Error scraping data for company ${company.Name}:`,
            error
          );
          newPostings[company.Name] = [];
          jobsPosted[company.Name] = [];
        }
        return jobsPosted;
      })
    );

    try {
      await savePostings(client, newPostings);
    } catch (error) {
      console.error("Error saving postings to database:", error);
      res.status(500).json({ error: "Failed to save postings to database" });
    }

    const message = Object.entries(newPostings)
      .filter(([, value]) => value.length > 0)
      .map(([company, jobs]) => `${company}:\n${jobs.join("\n")}`)
      .join("\n\n");

    if (message) {
      const msg = {
        message,
        title: "New Job Postings Found!",
        priority: 1,
        sound: "magic",
      };
      try {
        await push.send(msg);
      } catch (error) {
        console.error("Error sending push notification:", error);
        // Continue execution as push notification is not critical
      }
    }
    res.json(newPostings);
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

postingsRouter.delete("/", verifyToken, async (req: Request, res: Response) => {
  try {
    await client.query("UPDATE companies SET Postings = ARRAY[]::text[]");
    res.status(200).json({ message: "Successfully cleared all postings" });
  } catch (error) {
    console.error("Error clearing postings:", error);
    res.status(500).json({ error: "Failed to clear postings" });
  }
});

export { postingsRouter };
