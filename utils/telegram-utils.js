const fetch = require("node-fetch")
const { createReadStream, pathExists, writeFile } = require("fs-extra")
const FormData = require("form-data")
const { logger } = require("./assets")
const config = require("../config.json")

const chatIds = {}

const getChatID = async(username, bot_token, user) => {
  const res = await (await fetch(`https://api.telegram.org/bot${bot_token}/getUpdates`)).json()
  if (!res.ok && !res?.result?.length) {
    throw new Error(`Can't send message, ${username} didn't start the Bot`)
  }

  const chatId = (res?.result.filter(({ message }) => message?.chat?.username === username)[0])?.message?.chat?.id
  if (chatId) {
    chatIds[username] = chatId
    config.users[user].credentials.tg_chatId = `${chatId}`
    writeFile("./config.json", JSON.stringify(config, null, 2), "utf8", err => {
      if (err) {
        throw new Error("Errore durante la scrittura del file config")
      }
    })
  } else {
    throw new Error(`Can't send message, ${username} didn't start the Bot`)
  }
}

const checkParams = async(username, bot_token, user) => {
  if (!username || !bot_token) {
    throw new Error("Missing username or bot token")
  } else if (!chatIds[username]) {
    await getChatID(username, bot_token, user)
  }

  if (!chatIds[username]) {
    throw new Error(`Can't send message to ${username}`)
  }
}

const sendMessage = async(username, chatId, user, bot_token) => {
  try {
    if (!chatId) {
      await checkParams(username, bot_token, user)
    }

    const link = "https://presenze.unimore.it/spacemr/#?page=app_spacemr_space_user_presence__app_spacemr_space_user_presence_list&qparams=%7B%22where%22%3A%7B%22this%5Fuser%5Fname%22%3Atrue%2C%22from%5Ftoday%22%3Atrue%7D%7D"

    const telegramCall = new FormData()
    telegramCall.append("chat_id", chatId || chatIds[username])
    let endpoint = "sendPhoto"

    if (await pathExists(__dirname + `/../photos/pass-${username}.jpeg`)) {
      endpoint = "sendMediaGroup"

      const res = [
        {
          type: "photo",
          media: "attach://posto",
          parse_mode: "markdown",
          caption: `Hai prenotato l'aula. Per guardare la prenotazione segui questo [link](${link})`
        },
        {
          type: "photo",
          media: "attach://pass"
        }]

      telegramCall.append("media", JSON.stringify(res))
      telegramCall.append("posto", createReadStream(`./photos/img-${username}.jpeg`))
      telegramCall.append("pass", createReadStream(`./photos/pass-${username}.jpeg`))

    } else {
      telegramCall.append("parse_mode", "markdown")
      telegramCall.append("photo", createReadStream(`./photos/img-${username}.jpeg`))
      telegramCall.append("caption", `Hai prenotato l'aula. Per guardare la prenotazione segui questo [link](${link})`)
    }

    await fetch(`https://api.telegram.org/bot${bot_token}/${endpoint}`, {
      method: "POST",
      body: telegramCall
    })

  } catch (err) {
    logger(err)
  }
}

const sendError = async(username, chatId, user, bot_token, msg) => {
  try {
    if (!chatId) {
      await checkParams(username, bot_token, user)
    }
    const form = new FormData()
    form.append("chat_id", chatId || chatIds[username])
    form.append("parse_mode", "html")
    form.append("text", `<b>ERRORE</b>:\n${msg}`)

    await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
      method: "POST",
      body: form
    })

  } catch (err) {
    logger(err)
  }
}

module.exports = {
  sendMessage,
  sendError
}