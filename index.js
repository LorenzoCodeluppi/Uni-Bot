const puppeteer = require("puppeteer")
const cron = require("node-cron")
const { ensureDirSync } = require("fs-extra")

const { days, users, BOT_TOKEN, config, viewport, orario, logger } = require("./utils/assets")
const { sendMessage, sendError } = require("./utils/telegram-utils")


const reserve = async(user, classes) => {
  let tentativi = 0
  const { username, password, tg_username, tg_chatId } = users[user]?.credentials

  const browser = await puppeteer.launch(config)
  const page = await browser.newPage()
  await page.setViewport(viewport)

  await Promise.all([
    page.goto(`https://presenze.unimore.it/spacemr/#?page=s__prsncdd&sp=${classes}`),
    page.waitForNavigation(),
    page.waitForSelector("#username")
  ])

  await page.type("#username", username)

  try {
    while (tentativi <= 2 && await page.$("body > div > div > div > div.column.one > form > div:nth-child(4) > button")) {
      tentativi += 1
      await page.type("#password", password)
      await page.waitForTimeout(1000) // necessario perchè altrimenti potresti cliccare prima di inserire i dati
      await page.click("body > div > div > div > div.column.one > form > div:nth-child(4) > button")
      await page.waitForTimeout(2000)
    }

    if (tentativi > 2) {
      await sendError(tg_username, tg_chatId, user, BOT_TOKEN, "Non sono riuscito a prenotare l'aula a causa del login")
      throw new Error("Hai superato i tentativi per la password")
    }

    await Promise.all([
      page.waitForSelector("#id_spacemr_space_code")
    ])

    await page.waitForTimeout(2000) // necessario perchè girano dei loro script

    const popUpError = await (await (await page.$("#app_messages > div"))?.getProperty("textContent"))?.jsonValue()

    if (popUpError) {
      sendError(tg_username, tg_chatId, user, BOT_TOKEN, popUpError)
      throw new Error(popUpError)
    }


    await page.click("#app_pagecontent > form > div > div > p:nth-child(1) > button:nth-child(1)")
    await page.waitForTimeout(2000)
    ensureDirSync("./photos/")
    await page.screenshot({ path: `./photos/img-${tg_username}.jpeg`, fullPage: true })

    await sendMessage(tg_username, tg_chatId, user, BOT_TOKEN)

  } catch (err) {
    logger(err)
  }

  await browser.close()
}


const main = async() => {
  const day = days[new Date().getDay()]
  for (const user of Object.keys(users)) {
    if (!users[user]?.credentials.username || !users[user]?.credentials.password) {
      logger("Please insert username and password")
      break
    }

    for (const schoolClass of users[user][day]) {
      await reserve(user, schoolClass)
    }
  }
}


;(async() => {
  if (process.env.NODE_ENV === "dev") {
    await main()
  } else {
    cron.schedule(orario,  main)
  }
})()