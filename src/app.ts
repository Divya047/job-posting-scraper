import express, { Request, Response } from "express";
import puppeteer from "puppeteer";
import client from "./database.js";
import "dotenv/config";
const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

type Company = {
  Name: string;
  Url: string;
  ClassOfJobTitle: string;
  Postings: Array<string>;
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
    await client.connect();
    const res = await client.query("SELECT * FROM companies");
    companies = res.rows;
  } catch (e) {
    console.log(e);
  } finally {
    await client.end();
  }
  if (companies) {
    res.json(companies);
  } else {
    res.json([]);
  }
});

app.get("/new-postings", async (req: Request, res: Response) => {
  try {
    await client.connect();
    const companies = await client.query("SELECT * FROM companies");
    const jobs = await Promise.all(
      companies.rows.map((company: Company) =>
        scrap(company.Url, company.ClassOfJobTitle)
      )
    );
    const companyNames = companies.rows
      .map((company: Company) => company.Name)
      .flat();
    const jobsInDB = companies.rows.map((company: Company) => company.Postings);
    const newJobs = jobs.map((job, index) =>
      job.filter((j) => !jobsInDB[index].includes(j))
    );
    await client.end();
    res.send(newJobs);
  } catch (e) {
    console.log(e);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
