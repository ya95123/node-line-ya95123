// 引用 linebot套件
import linebot from 'linebot'
// 引用 doyenv 套件
import dotenv from 'dotenv'
// 引用 request 套件
import rp from 'request-promise'
// 引用 import 套件
import cheerio from 'cheerio'

// 讀取 .env 檔
dotenv.config()

// 宣告機器人的資訊
const bot = linebot({
  // process 自動讀取 env 裡的資料
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

// 正則去掉所有的html标记
function delHtmlTag(str) {
  return str.replace(/<[^>]+>/g, '')
}
// delHtmlTag('<p>123456</p><span>我是誰?</sapn')
// console.log(delHtmlTag('<p>123456</p><span>我是誰?</sapn>'))

// const $ = cheerio.load('<p style="margin-left:0cm; margin-right:0cm; text-align:justify"><span style="background-color:white">馬來西亞經濟學者咸認為，馬國雖有效抑制新型冠狀病毒疫情擴散')
// console.log($('p').text())

// 當收到訊息時
bot.on('message', async (event) => {
  // 抓API回復
  let msg = ''
  try {
    const data = await rp({ uri: 'https://www.trade.gov.tw/Api/Get/pages?nodeid=45&timeRestrict=true', json: true })
    // const $ = cheerio.load(data[0].PageContent)
    // console.log(($('p').text()))
    // msg = $('p').text()
    // msg = data.entry[0].title
    // console.log(delHtmlTag(data[0].PageContent))
    msg = `${delHtmlTag(data[0].PagePublishTime)}\n\n近期消息：${delHtmlTag(data[0].PageTitle)}\n${delHtmlTag(data[0].PageContent)}`
  } catch (error) {
    msg = '發生錯誤'
  }
  event.reply(msg)
})
// 重複你的話(打法)
// bot.on('message', event=> {
//   if(event.message.type === 'text'){
//     event.reply(event.message.text)
//   }
// })

// 在 port 啟動， '/' 為根目錄
bot.listen('/', process.env.PORT, () => {
  console.log('機器人已啟動')
})
