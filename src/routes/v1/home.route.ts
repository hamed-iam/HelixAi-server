import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

// import run from "../../bot.js";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let browser: any;
// let page: any;

(async () => {
  browser = await puppeteer.launch({
    headless: false,
    executablePath: "/usr/bin/chromium",
  });
  // page = await browser.newPage();
  // await page.goto("https://dkhobreh.exirbroker.com/login");
  console.log("Puppeteer started");
})();

router.get("/", async (_, res: any) => {
  const page = await browser.newPage();
  await page.goto("https://dkhobreh.exirbroker.com/login");

  await page.$eval(
    "#userNameInput",
    (el: any) => (el.value = "test@example.com")
  );

  await page.$eval(
    "#mat-input-2",
    (el: any) => (el.value = "test@example.com")
  );

  await page.waitForSelector(".rh-captcha-container"); // wait for the selector to load
  const element: any = await page.$(".rh-captcha-container"); // declare a variable with an ElementHandle
  await element.screenshot({ path: "captcha.png" }).then(() => {
    fs.readFile(
      path.resolve(__dirname, "../../../captcha.png"),
      (err, data) => {
        if (err) {
          res.status(500).send("An error occurred");
        } else {
          console.log("data", data);
          // console.log("data type", typeof data);
          // res.sendFile(data);
          const filePath = path.resolve(__dirname, "../../../captcha.png");
          // res.sendFile(filePath);
          const file = fs.readFileSync(filePath);
          const fileBuffer = Buffer.from(file);
          const fileBase64 = fileBuffer.toString("base64");
          res.send({ image: fileBase64 });

          // res.set("Content-Type", "image/png");
          // res.send(data);
        }
      }
    );
  });
});

router.post("/", async (req) => {
  console.log("req", req.body);
  // console.log("res", res);
  // await page.$eval(
  //   ".number-input",
  //   (el: any) => (el.value = req.body.captcha)
  // );

  // run(false, "slkjfs");
});

export default router;
