import puppeteer from "puppeteer";

async function getCaptcha(browser: any, captcha: string, page: any) {
  await page.$eval("#mat-input-2", (el: any) => (el.value = captcha));
  await browser.close();
}

export default async function run(init: "init" | boolean, captcha?: string) {
  try {
    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium",
      headless: true,
    });
    const page = await browser.newPage();
    if (init) {
      //Randomize viewport size
      // await page.setViewport({
      //   width: 1920 + Math.floor(Math.random() * 100),
      //   height: 3000 + Math.floor(Math.random() * 100),
      //   deviceScaleFactor: 1,
      //   hasTouch: false,
      //   isLandscape: false,
      //   isMobile: false,
      // });
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
      await element.screenshot({ path: "captcha.png" });

      // getCaptcha(browser);

      return true;
    }
    if (captcha) {
      getCaptcha(browser, captcha, page);
    }
  } catch (error) {
    return error;
  }
}
