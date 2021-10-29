const net = require("net")

const client = net.createConnection({ port: 8080 })

const { appendFile, ensureFile } = require("fs-extra")
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
]


const { users, BOT_TOKEN, config, viewport, orario } = require("../config.json")

const logger = (log) => {
  ensureFile("./log.txt", err => err ? console.error(log, "\n", err) && process.exit(1) : false)
  appendFile("./log.txt", `[${(new Date()).toString().replace(/ GMT.*$/gm, "")}] ${log} \n`)
}

const sendStatus = (data) => {
  if (process.env.NODE_ENV === "dev") {
    client.write(JSON.stringify(data))
  }
}

module.exports = {
  days,
  users,
  BOT_TOKEN,
  config,
  viewport,
  orario,
  logger,
  sendStatus
}