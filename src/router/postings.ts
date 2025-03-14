import express, { Request, Response } from "express";
import client from "../database.js";
import { companyPosts, Company } from "../types.js";
import { savePostings, scrap } from "../helper-functions.js";
// Temporary require declaration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const require: any;
const Push = require("pushover-notifications");
const postingsRouter = express.Router();

const push = new Push({
  user: process.env.PUSHOVER_USER,
  token: process.env.PUSHOVER_TOKEN,
});

postingsRouter.get("/new-postings", async (req: Request, res: Response) => {
  try {
    const companies = await client.query("SELECT * FROM companies");
    const jobsPosted: companyPosts = {};
    const newPostings: companyPosts = {};
    await Promise.all(
      companies.rows.map(async (company: Company) => {
        const posts = await scrap(company.Url, company.ClassOfJobTitle);
        const oldPosts = company.Postings;
        const newPosts = posts.filter((post) => !oldPosts.includes(post));
        newPostings[company.Name] = newPosts;
        jobsPosted[company.Name] = posts;
        return jobsPosted;
      })
    );
    await savePostings(client, newPostings);
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
      push.send(msg);
    }
    res.json(newPostings);
  } catch (e) {
    console.log(e);
  }
});

export { postingsRouter };
