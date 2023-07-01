import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";
import morgan from "morgan";
// import routes from "../routes/v1/index.js";

// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

import puppeteer from "puppeteer";

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
  "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393",
  // Add more user-agent strings here...
];

const ExpressConfig = (): Application => {
  const app = express();
  app.use(compression());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // enable cors
  app.use(cors());
  app.options("*", cors());

  app.use(helmet());
  app.use(cookieParser());
  app.use(morgan("dev"));

  // v1 api routes
  // app.use("/v1", routes);
  // --------------------

  let browser: any;
  let page: any;

  app.get("/captcha", async (_, res) => {
    try {
      page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto("https://dkhobreh.exirbroker.com/login", {
        timeout: 60000,
      });

      await page.waitForSelector(".rh-captcha-container", { visible: true });
      const element = await page.$(".rh-captcha-container");
      const screenshot = await element.screenshot({ encoding: "base64" });

      res.send({ image: screenshot });
    } catch (error) {
      res.status(500).send("An error occurred");
      if (browser) {
        await browser.close();
      }
    }
  });

  app.post("/captcha", async (req, res) => {
    const { captcha } = req.body;

    const setInputValue = async (selector: any, value: any) => {
      await page.focus(selector);
      await page.waitForSelector(selector, { visible: true });
      await page.type(selector, value);
      await page.evaluate(
        (selector: any) =>
          document.querySelector(selector).dispatchEvent(new Event("blur")),
        selector
      );
    };

    await setInputValue("#userNameInput", "ghanbarim");
    await setInputValue("#mat-input-2", "!123456789aA");
    await setInputValue("#captchaText", captcha);

    await Promise.all([page.waitForNavigation(), page.click("#btn-login")]);

    // Wait for the elements to become visible on the page
    await page.waitForSelector(".rh-hyperlink-red", {
      visible: true,
    });

    const elements = await page.evaluate(() => {
      const list = Array.from(document.querySelectorAll(".rh-hyperlink-red"));
      return list.map((element: any) => element.textContent.trim());
    });
    console.log("elements", elements);

    // Send the list of elements as a response
    // res.status(200).json(elements);
    return res.status(200).json(elements);
  });

  (async () => {
    browser = await puppeteer.launch({
      headless: false,
      executablePath: "/usr/bin/chromium",
    });
    page = await browser.newPage();
    const randomUserAgent =
      userAgents[Math.floor(Math.random() * userAgents.length)];
    await page.setUserAgent(randomUserAgent);

    console.log("Puppeteer browser launched");
  })();

  // -----------------------
  return app;
};

export default ExpressConfig;
