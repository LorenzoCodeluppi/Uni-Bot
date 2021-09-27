const fetch = require("node-fetch")
const { createReadStream, pathExists } = require("fs-extra")
const FormData = require("form-data")
const { logger } = require("./assets")
const chatIds = {}

const getChatID = async(username, bot_token) => {
  const res = await (await fetch(`https://api.telegram.org/bot${bot_token}/getUpdates`)).json()
  if (!res.ok && !res?.result?.length) {
    throw new Error(`Can't send message, ${username} didn't start the Bot`)
  }

  const chatId = (res?.result.filter(({ message }) => message?.chat?.username === username)[0])?.message?.chat?.id
  if (chatId) {
    chatIds[username] = chatId
  } else {
    throw new Error(`Can't send message, ${username} didn't start the Bot`)
  }
}

const checkParams = async(username, bot_token) => {
  if (!username || !bot_token) {
    throw new Error(`Missing username or bot token`)
  } else if (!chatIds[username]) {
    await getChatID(username, bot_token)
  }

  if (!chatIds[username]) {
    throw new Error(`Can't send message to ${username}`)
  }
}

const sendMessage = async(username, bot_token) => {
  try {
    await checkParams(username, bot_token)
    const urlCall = new FormData()
    urlCall.append("u",
      "https://presenze.unimore.it/spacemr/#?page=app_spacemr_space_user_presence__app_spacemr_space_user_presence_list&qparams={%22where%22:{%22this_user_name%22:true,%22from_today%22:true}}"
    )

    const link = (
      await (
        await fetch("https://www.shorturl.at/shortener.php", { method: "POST", body: urlCall })
      ).text()
    ).match(/shorturl.at\/\w+/gm)[0]

    const telegramCall = new FormData()
    telegramCall.append("chat_id", chatIds[username])
    let endpoint = "sendPhoto"

    if (await pathExists(__dirname + `/../photos/pass-${username}.jpeg`)) {
      endpoint = "sendMediaGroup"

      const res = [
        {
          type: "photo",
          media: "attach://posto",
          parse_mode: "markdown",
          caption: `Hai prenotato l'aula. Per guardare la prenotazione segui questo [link](http://www.${link})`
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
      telegramCall.append("caption", `Hai prenotato l'aula. Per guardare la prenotazione segui questo [link](http://www.${link})`)
    }

    await fetch(`https://api.telegram.org/bot${bot_token}/${endpoint}`, {
      method: "POST",
      body: telegramCall
    })

  } catch (err) {
    logger(err)
  }
}

const sendError = async(username, bot_token, msg) => {
  try {
    await checkParams(username, bot_token)
    const form = new FormData()
    form.append("chat_id", chatIds[username])
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