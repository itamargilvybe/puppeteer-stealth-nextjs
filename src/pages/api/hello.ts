// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import puppeteer from "puppeteer-extra";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  puppeteer.use(StealthPlugin());

  const { id } = await createSession();
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://connect.browserbase.com?apiKey=${process.env.BROWSERBASE_API_KEY}&sessionId=${id}`,
  });

  const pages = await browser.pages();
  const page = pages[0];

  try {
    await page.goto("https://www.chatgpt.com");

    const signInButton = await page.waitForSelector(`[data-testid*="login"]`, {
      visible: true,
      timeout: 20000,
    });
    await signInButton?.click();

    console.log("step2");

    const emailIntput = await page.waitForSelector(`[class*="email"]`, {
      visible: true,
      timeout: 20000,
    });

    await emailIntput?.type("profoundunicorn@gmail.com");

    console.log("step4");

    await page.keyboard.press("Enter");

    console.log("step5");

    const passwordIntput = await page.waitForSelector(`[class*="password"]`, {
      visible: true,
      timeout: 10000,
    });

    await passwordIntput?.type("pro123foundA");

    console.log("step6");

    await page.keyboard.press("Enter");

    console.log("step7");

    const promptInput = await page.waitForSelector(`[class*="prompt"]`, {
      visible: true,
      timeout: 10000,
    });

    await promptInput?.type("Hey how are you?");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await page.keyboard.press("Enter");

    console.log("step8");

    const response = await page.waitForSelector(
      `[class*="conversation-turn"]`,
      {
        visible: true,
        timeout: 10000,
      }
    );

    console.log("response", response);

    await page.close();
    await browser.close();
    res.status(200).json({ name: "success" });
  } catch (error) {
    console.log(error);

    await page.close();
    await browser.close();

    res.status(200).json({ name: `${(error as Error).message}` });
  }
}

async function createSession() {
  const response = await fetch(`https://www.browserbase.com/v1/sessions`, {
    method: "POST",
    headers: {
      "x-bb-api-key": `${process.env.BROWSERBASE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      proxies: true,
      // browserSettings: {
      //   solveCaptchas: false,
      // },
    }),
  });
  const json = await response.json();
  return json;
}
