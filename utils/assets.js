const net = require("net")

const client = net.createConnection({ port: 8080 })

// indica il numero massimo di messaggi che inoltrerà al server, utile per ottenere il progress
const MAX_ATTEMPTS = 7

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

const sendStatus = (user, error, sentence, totalUsers, progress, isAula = true) => {
  if (process.env.NODE_ENV === "dev") {
    client.write(JSON.stringify({ user, isAula, error, sentence, progress: Math.ceil((100 * progress) / (totalUsers * MAX_ATTEMPTS)) }))
  }
}

const sleep = (ms) =>  {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
  days,
  users,
  BOT_TOKEN,
  config,
  viewport,
  orario,
  logger,
  sendStatus,
  sleep,
  MAX_ATTEMPTS
}