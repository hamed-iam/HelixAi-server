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

  // let browser: any;
  // let page: any;

  // const __filename = fileURLToPath(import.meta.url);
  // const __dirname = path.dirname(__filename);

  // app.get("/captcha", async (_, res) => {
  //   // const page = await browser.newPage();
  //   await page.goto("https://dkhobreh.exirbroker.com/login");

  //   await page.waitForSelector(".rh-captcha-container"); // wait for the selector to load
  //   const element: any = await page.$(".rh-captcha-container"); // declare a variable with an ElementHandle
  //   await element.screenshot({ path: "captcha.png" }).then(() => {
  //     fs.readFile(path.resolve(__dirname, "../../captcha.png"), (err) => {
  //       if (err) {
  //         res.status(500).send("An error occurred");
  //         browser.close();
  //       } else {
  //         const filePath = path.resolve(__dirname, "../../captcha.png");
  //         const file = fs.readFileSync(filePath);
  //         const fileBuffer = Buffer.from(file);
  //         const fileBase64 = fileBuffer.toString("base64");
  //         res.send({ image: fileBase64 });
  //       }
  //     });
  //   });
  // });

  // app.post("/captcha", async (req, res) => {
  //   const cap = req.body.captcha

  //   // USERNAME
  //   await page.focus("#userNameInput");

  //   await page.waitForFunction(
  //     () => document.activeElement === document.querySelector("#userNameInput")
  //   );

  //   await page.type('#userNameInput', 'test@example.com');

  //   await page.evaluate(() =>
  //     document.querySelector("#userNameInput")!.dispatchEvent(new Event("blur"))
  //   );

  //   // PASSWORD

  //   await page.focus("#mat-input-2");

  //   await page.waitForFunction(
  //     () => document.activeElement === document.querySelector("#mat-input-2")
  //   );

  //   await page.type('#mat-input-2', 'test@example.com');

  //   await page.evaluate(() =>
  //     document.querySelector("#mat-input-2")!.dispatchEvent(new Event("blur"))
  //   );
  //   await page.focus("#captchaText");

  //   await page.type('#captchaText', cap);

  //   await page.click("#btn-login");
  //   res.status(200);
  // });

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

    res.sendStatus(200);
  });

  (async () => {
    browser = await puppeteer.launch({
      headless: false,
      executablePath: "/usr/bin/chromium",
    });
    page = await browser.newPage();

    console.log("Puppeteer browser launched");
  })();

  // -----------------------

  return app;
};

export default ExpressConfig;
