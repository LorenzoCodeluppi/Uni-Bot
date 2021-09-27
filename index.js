const puppeteer = require("puppeteer");
const { sendMessage } = require("./utilis/telegram-utilis")
const { days,week } = require("./utilis/assets")
require('dotenv').config()


const init = async () => {
  
  if(week[days[[new Date().getDay()]]]){
    const browser = await puppeteer.launch(
    {
      headless: false
    });
    const page = await browser.newPage();
    await page.goto(`https://presenze.unimore.it/spacemr/#?page=s__prsncdd&sp=${process.env.AULA}`)
    await Promise.all([
      page.waitForNavigation(),
      await page.click("#app_login_area")
    ]);
    await page.type('#username', `${process.env.USERNAME}`);
    await page.type('#password', `${process.env.PASSWORD}`);
    await Promise.all([
      page.waitForNavigation(),
      await page.click(".form-button")
    ]);

    await page.waitForNavigation()
    await page.waitForTimeout(2000)
    try{
      if(await page.waitForSelector('#app_pagecontent > form > div > div > p:nth-child(1) > button:nth-child(1)',{visible:true, timeout:5000}) != null){
        await page.click("#app_pagecontent > form > div > div > p:nth-child(1) > button:nth-child(1)")
        await page.waitForTimeout(2000)
        await page.screenshot({ path:"./img.jpeg",fullPage: true})
        sendMessage()
      }
      browser.close()
    } catch{
      browser.close()
    }
  }
}
init()
