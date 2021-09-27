const fetch= require("node-fetch")
const fs = require('fs-extra')
const FormData = require('form-data');

const e = module.exports

e.sendMessage = async() => {
  const form = new FormData()
  form.append("chat_id", process.env.CHAT_ID)
  form.append("photo", fs.createReadStream("./img.jpeg"))
  form.append("caption", "https://presenze.unimore.it/spacemr/#?page=app_spacemr_space_user_presence__app_spacemr_space_user_presence_list&qparams={%22where%22:{%22this_user_name%22:true,%22from_today%22:true}}")
  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`,{
    method: "POST",
    body:form
  })
}
