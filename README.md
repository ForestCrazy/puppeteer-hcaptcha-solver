# Puppeteer-hcaptcha-solver (fork)

# Installation:

`npm install https://github.com/ForestCrazy/puppeteer-hcaptcha-solver.git`

## Basic Usage:

```js
const { PuppeterHcaptchaSolve } = require("puppeteer-hcaptcha-solver");
const puppeteer = require("puppeteer");
(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const captcha = new PuppeterHcaptchaSolve(); // if you want to use ghost-cursor to make human-like mousemovements simply set `use_gc` to true, like this `new PuppeterHcaptchaSolve(true)`
    try {
        const page = await browser.newPage()
        await page.setDefaultNavigationTimeout(0);

        await page.goto("https://accounts.hcaptcha.com/demo?sitekey=4c672d35-0701-42b2-88c3-78380b0db560", {
            waitUntil: 'load',
            timeout: 0

        });
        await page.waitForSelector("iframe")
        console.log("Hcaptcha detected")
        try {
            const token = await captcha.solve(page); // this function will return the hcaptcha_token string which u can use in other applications as well. 
            console.log(token)
        } catch (err) {
            console.log(err)
        }
    } catch (e) {
        throw e
    }
})()
```

# Puppeteer-hcaptcha-solver (original)

Solve Hcaptcha on any website using puppeteer

Author: Shahzain

PRS Are greatly appreciated.

# Installation:

`yarn add puppeteer-hcaptcha-solver`

`npm install puppeteer-hcaptcha-solver`

## Basic Usage:

Note: You need python to use this module.

```js
const { PuppeterHcaptchaSolve } = require("puppeteer-hcaptcha-solver");
const puppeteer = require("puppeteer");
(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const captcha = new PuppeterHcaptchaSolve(browser); // if you want to use ghost-cursor to make human-like mousemovements simply set `use_gc` to true, like this `new PuppeterHcaptchaSolve(browser, true)`
    try {
        const page = await browser.newPage()
        await page.setDefaultNavigationTimeout(0);

        await page.goto("https://accounts.hcaptcha.com/demo?sitekey=4c672d35-0701-42b2-88c3-78380b0db560", {
            waitUntil: 'load',
            timeout: 0

        });
        await page.waitForSelector("iframe")
        console.log("Hcaptcha detected")
        setTimeout(async () => {
            const token = await captcha.solve(page); // this function will return the hcaptcha_token string which u can use in other applications as well. 
            console.log(token)
        }, 2000)
    } catch (e) {
        throw e
    }
})()
```
# Does this package support puppeteer-extra?

Yes! It does support puppeteer-extra.

# Puppeteer-Hcaptcha-Solver in action
![](https://hi.shahzain.me/r/puppeteer-hcaptcha.gif)
# Credits

[QIN2DIM](https://github.com/QIN2DIM) For his great AI work.
