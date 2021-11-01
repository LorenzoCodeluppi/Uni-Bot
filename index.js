const puppeteer = require("puppeteer")
const cron = require("node-cron")
const { ensureDirSync } = require("fs-extra")

const { days, users, BOT_TOKEN, config, viewport, orario, logger, sendStatus, MAX_ATTEMPTS } = require("./utils/assets")
const { sendMessage, sendError } = require("./utils/telegram-utils")


const reserve = async(user, classes, totalUsers, userNumber) => {
  let tentativi = 0
  const { username, password, tg_username, tg_chatId } = users[user]?.credentials

  const browser = await puppeteer.launch(config)
  const page = await browser.newPage()
  await page.setViewport(viewport)

  sendStatus(user, false, "Bot avviato correttamente...", totalUsers, 1 + (userNumber * MAX_ATTEMPTS))

  await Promise.all([
    page.goto(`https://presenze.unimore.it/spacemr/#?page=s__prsncdd&sp=${classes}`),
    page.waitForNavigation(),
    page.waitForSelector("#username")
  ])

  await page.type("#username", username)

  try {

    sendStatus(user, false, "Avvio procedure di login al portale di ESSE3...", totalUsers, 2 + (userNumber * MAX_ATTEMPTS))
    while (tentativi <= 2 && await page.$("body > div > div > div > div.column.one > form > div:nth-child(4) > button")) {
      tentativi += 1

      sendStatus(user, false, `Tentativo di login n° ${tentativi}...`, totalUsers, 3 + (userNumber * MAX_ATTEMPTS))
      await page.type("#password", password)
      await page.waitForTimeout(1000) // necessario perchè altrimenti potresti cliccare prima di inserire i dati
      await page.click("body > div > div > div > div.column.one > form > div:nth-child(4) > button")
      await page.waitForTimeout(2000)
    }

    if (tentativi > 2) {
      sendStatus(user, true, "Errore durante il login: username o password errati", totalUsers, 7 + (userNumber * MAX_ATTEMPTS))
      await sendError(tg_username, tg_chatId, user, BOT_TOKEN, "Non sono riuscito a prenotare l'aula a causa del login")
      throw new Error("Hai superato i tentativi per la password")
    }

    sendStatus(user, false, "Login completato con successo...", totalUsers, 4 + (userNumber * MAX_ATTEMPTS))
    await Promise.all([
      page.waitForSelector("#id_spacemr_space_code")
    ])

    await page.waitForTimeout(2000) // necessario perchè girano dei loro script

    const popUpError = await (await (await page.$("#app_messages > div"))?.getProperty("textContent"))?.jsonValue()

    if (popUpError) {
      sendStatus(user, true, "Impossibile prenotare l'aula richiesta, terminazione...", totalUsers, 7 + (userNumber * MAX_ATTEMPTS))
      sendError(tg_username, tg_chatId, user, BOT_TOKEN, popUpError)
      throw new Error(popUpError)
    }

    sendStatus(user, false, "Inserimento presenza...", totalUsers, 5 + (userNumber * MAX_ATTEMPTS))

    await page.click("#app_pagecontent > form > div > div > p:nth-child(1) > button:nth-child(1)")
    await page.waitForTimeout(2000)
    ensureDirSync("./photos/")
    await page.screenshot({ path: `./photos/img-${tg_username}.jpeg`, fullPage: true })

    sendStatus(user, false, "Screenshot effettuato...", totalUsers, 6 + (userNumber * MAX_ATTEMPTS))

    await sendMessage(tg_username, tg_chatId, user, BOT_TOKEN)

    sendStatus(user, false, "Esecuzione terminata con successo", totalUsers, 7 + (userNumber * MAX_ATTEMPTS))

  } catch (err) {
    logger(err)
  }

  await browser.close()
}


const main = async() => {
  const day = days[new Date().getDay()]
  const totalUsers = Object.keys(users)
  for (const user of totalUsers) {
    if (!users[user]?.credentials.username || !users[user]?.credentials.password) {
      logger("Please insert username and password")
      sendStatus(user, true, "Compila la configurazione in modo corretto", totalUsers.length, 7 + (totalUsers.indexOf(user) * MAX_ATTEMPTS))
      break
    }

    if (!users[user][day].length) {
      sendStatus(user, false, "Non ci sono aule da prenotare questo giorno", totalUsers.length, 7 + (totalUsers.indexOf(user) * MAX_ATTEMPTS), false)
    }

    for (const schoolClass of users[user][day]) {
      await reserve(user, schoolClass, totalUsers.length, totalUsers.indexOf(user))
    }
  }
  sendStatus(null, false, "Terminazione del bot..", totalUsers.length, totalUsers.length * MAX_ATTEMPTS)
}


;(async() => {
  if (process.env.NODE_ENV === "dev") {
    await main()
    process.send("ready")
  } else {
    cron.schedule(orario,  main)
  }
})()