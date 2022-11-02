/**
 * @author Shahzain Masood
 * Github: https://github.com/shahzain345/puppeteer-hcaptcha-solver
 */
import { Page, Frame } from "puppeteer";
import { createCursor } from "ghost-cursor-frames";
import { get_result } from "./python/get_result";
import { install_py_files } from "./installation";
import { rejects } from "assert";
const sleep = (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};
export class PuppeterHcaptchaSolve {
  use_gc: boolean;
  constructor(use_gc: boolean) {
    this.use_gc = use_gc;
  }
  async solve(page: Page) {
    return Promise.race([
      new Promise(async (resolve, rejects) => {
        await page
          .waitForSelector(
            'div.check[style="width: 30px; height: 30px; display: block; position: absolute; top: 0px; left: 0px; animation: 0.4s linear 0s 1 normal none running pop;"]'
          )
          .then(resolve)
          .catch(rejects);
      }),
      new Promise(async (resolve, rejects) => {
        await page.waitForTimeout(4000);
        const isElmPresent = await this._detect_captcha(page);
        let cursor: any = null;
        if (isElmPresent) {
          await page.click("div.h-captcha > iframe");
          const frame = await page
            .frames()
            .find((x) => x.url().includes("https://newassets.hcaptcha.com"));
          if (frame !== null && frame !== undefined) {
            await frame.waitForSelector(".prompt-text").catch(async (e) => {
              const token = await page.evaluate("hcaptcha.getResponse();");
              if (token !== "") {
                resolve(token);
              } else {
                resolve("Failed");
              }
            });

            await frame.click(".language-selector");
            const [btnLang] = await frame.$x(
              "//span[contains(text(), 'English')]"
            );
            if (btnLang) {
              await btnLang
                .click()
                .catch((e) => console.log("Failed to translate text"));
            }
            const elm = await frame.$(".prompt-text");
            const _challenge_question = await frame.evaluate(
              (el) => el.textContent,
              elm
            );
            if (this.use_gc) {
              cursor = await createCursor(page);
            }
            const token = await this._click_good_images(
              frame,
              _challenge_question,
              page,
              cursor
            );
            resolve(token);
          }
        } else {
          // throw Error("Captcha not detected");
          rejects("Captcha not detected");
        }
      }),
    ]);
  }

  private async _detect_captcha(page: Page) {
    try {
      await page.waitForSelector("div.h-captcha > iframe");
      return true;
    } catch (e) {
      return false;
    }
  }

  private async _click_submit(frame: Frame, cursor: any) {
    if (cursor !== null) {
      await cursor.click(".button-submit", {}, frame);
    } else {
      await frame.click(".button-submit");
    }
  }

  private async _click_good_images(
    frame: Frame,
    label: string,
    page: Page,
    cursor: any
  ): Promise<string | undefined> {
    return new Promise(async (resolve) => {
      await sleep(0.5);
      for (let i = 0; i < 9; i++) {
        await frame.waitForSelector(`div.task-image:nth-child(${i + 1})`, {
          visible: true,
        });
        await frame.waitForSelector(
          `div.task-image:nth-child(${
            i + 1
          }) > div:nth-child(2) > div:nth-child(1)`,
          {
            visible: true,
          }
        );
        await frame.waitForFunction(
          (i) =>
            document
              .querySelector(
                `div.task-image:nth-child(${
                  i + 1
                }) > div:nth-child(2) > div:nth-child(1)`
              )
              ?.getAttribute("style")
              ?.indexOf("url(") !== -1,
          {},
          i
        );
        const elementHandle = await frame.$(
          `div.task-image:nth-child(${
            i + 1
          }) > div:nth-child(2) > div:nth-child(1)`
        );
        const style: string = await frame.evaluate(
          (el) => el.getAttribute("style"),
          elementHandle
        );
        const url = await style.split('url("')[1].split('")')[0];
        const res = await get_result(url, label);
        if (res) {
          if (cursor !== null) {
            await cursor.click(`div.task-image:nth-child(${i + 1})`, {}, frame);
          } else {
            await frame.click(`div.task-image:nth-child(${i + 1})`);
          }
        }
        if (i == 8) {
          await this._click_submit(frame, cursor);
          await sleep(1.5);
          const token = await page.evaluate("hcaptcha.getResponse();");
          resolve(token);
        }
      }
    });
  }
}
(async () => {
  await install_py_files();
})();
