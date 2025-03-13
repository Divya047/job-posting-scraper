import express, { Request, Response } from "express";
import puppeteer from "puppeteer";
import client from "./database.js";
import { companyPosts, Company } from "./types.js";
import { Client } from "pg";
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

const savePostings = async (client: Client, newPosts: companyPosts) => {
  return await Promise.all(
    Object.entries(newPosts).map(async ([key, value]) => {
      if (value.length > 0) {
        try {
          const response = await client.query(
            'UPDATE companies SET "Postings" = "Postings" || $1 WHERE "Name" = $2',
            [value, key]
          );
          return response;
        } catch (e) {
          console.log(e);
        }
        return;
      }
    })
  );
};

const scrap = async (
  url: string,
  titleClass: string
): Promise<Array<string>> => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector(titleClass);
  const jobs = await page.evaluate((titleClass: string) => {
    const jobList: HTMLElement[] = Array.from(
      document.querySelectorAll(titleClass)
    );
    return jobList.map((job: HTMLElement) => job.innerText);
  }, titleClass);
  await browser.close();
  return jobs;
};

app.get("/companies", async (req, res) => {
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

app.get("/new-postings", async (req: Request, res: Response) => {
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
    res.json(newPostings);
  } catch (e) {
    console.log(e);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
