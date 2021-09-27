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

module.exports = {
  days,
  users,
  BOT_TOKEN,
  config,
  viewport,
  orario,
  logger
}