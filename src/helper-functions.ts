import puppeteer from "puppeteer";
import { Client } from "pg";
import { companyPosts } from "./types.js";

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
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ["--no-sandbox"],
  });
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

export { savePostings, scrap };
