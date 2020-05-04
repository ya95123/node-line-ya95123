// 引用 linebot套件
import linebot from 'linebot'
// 引用 doyenv 套件
import dotenv from 'dotenv'
// 引用 request 套件
import rp from 'request-promise'
// 引用 import 套件
import cheerio from 'cheerio'
// cheerio 用法
// const $ = cheerio.load('<p style="margin-left:0cm; margin-right:0cm; text-align:justify"><span style="background-color:white">馬來西亞經濟學者咸認為，馬國雖有效抑制新型冠狀病毒疫情擴散')
// console.log($('p').text())
// (放在回覆裡面)
// msg = $('p').text()
// console.log(delHtmlTag(data[0].PageContent))

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
const delHtmlTag = (str) => {
  return str.replace(/<[^>]+>/g, '')
}
const delDot = (str) => {
  return str.replace(/,/g, ' ')
}
const delT = (str) => {
  return str.replace(/T/g, ' ')
}

// 當收到訊息時
bot.on('message', async (event) => {
  // 抓API回復
  // TODO 1.打出國家名稱/數量，跳出該國經濟新聞(篇數)(看能不能分段傳) 2.今日最新消息 3.圖文按鈕(歐洲/美洲/中東/亞洲)
  let msg = ''
  try {
    const data = await rp({ uri: 'https://www.trade.gov.tw/Api/Get/pages?nodeid=45&timeRestrict=true', json: true })

    msg = `台灣時間：${delT(data[0].PagePublishTime)}\n地區：${delDot(data[0].PageSummary)}\n⭐ 近期消息 ⭐\n「${data[0].PageTitle}」\n\n📨 主要內容：${delHtmlTag(data[0].PageContent)}\n消息來源皆自：\n經濟部國際貿易局 經貿資訊網\nhttps://www.trade.gov.tw/World/List.aspx?code=7020&nodeID=45&areaID=4&country=b645Lit5ZyL5aSn6Zm4`
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
