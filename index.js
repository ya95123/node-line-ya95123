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
const delSpace = (str) => {
  return str.replace(/&nbsp;/g, '')
}
const delDot = (str) => {
  return str.replace(/,/g, ' ')
}
const delT = (str) => {
  return str.replace(/T/g, ' ')
}
const delLine = (str) => {
  return str.replace(/-/g, '/')
}

const msgE = '發生錯誤！'

// 當收到訊息時
bot.on('message', async (event) => {
  // 抓API回復
  // TODO 1.打出國家名稱/數量，跳出該國經濟新聞(篇數)(看能不能分段傳) 2.今日最新消息 3.圖文按鈕(歐洲/美洲/中東/亞洲)

  // TODO **先測試成功再繼續寫條件式
  try {
    const data = await rp({ uri: 'https://www.trade.gov.tw/Api/Get/pages?nodeid=45&timeRestrict=true', json: true })
    // msg 回傳訊息，用陣列是可以分開對話框訊息
    const msg = []

    if (parseInt(event.message.text) <= 5) {
      // 指定最新幾則(5則以下)
      for (let i = 0; i < parseInt(event.message.text); i++) {
        msg[i] = `第 ${i + 1} 則\n台灣時間：${delLine(delT(data[i].PagePublishTime))}\n地區：${delDot(data[i].PageSummary)}\n⭐ 最新消息\n${data[i].PageTitle}\n\n📨 主要內容\n${delSpace(delHtmlTag(data[i].PageContent))}`

        if (i === (parseInt(event.message.text) - 1)) {
          msg[i] = `第 ${i + 1} 則\n台灣時間：${delLine(delT(data[i].PagePublishTime))}\n地區：${delDot(data[i].PageSummary)}\n⭐ 最新消息\n${data[i].PageTitle}\n\n📨 主要內容\n${delSpace(delHtmlTag(data[i].PageContent))}\n消息來源皆自：\n經濟部國際貿易局 經貿資訊網\nhttps://www.trade.gov.tw/World/List.aspx?code=7020&nodeID=45&areaID=4&country=b645Lit5ZyL5aSn6Zm4`
          event.reply(msg)
        }
      }
    } else {
      msg[0] = '我好像看不懂啊...你是想跟我聊天嗎?\n或是到 經濟部國際貿易局 經貿資訊網查詢：\nhttps://www.trade.gov.tw/World/List.aspx?code=7020&nodeID=45&areaID=4&country=b645Lit5ZyL5aSn6Zm4'
      event.reply(msg)
    }

    // 國家全部
    for (let i = 0; i < data.length; i++) {
      if (data[i].PageSummary.includes(event.message.text)) {
        msg[i] = `${i + 1}.台灣時間：${delLine(delT(data[i].PagePublishTime))}\n地區：${delDot(data[i].PageSummary)}\n⭐ 最新消息\n${data[i].PageTitle}\n\n📨 主要內容\n${delSpace(delHtmlTag(data[i].PageContent))}`
      }
      if (i === data.length - 1) {
        msg[i] = '消息來源皆自：\n經濟部國際貿易局 經貿資訊網\nhttps://www.trade.gov.tw/World/List.aspx?code=7020&nodeID=45&areaID=4&country=b645Lit5ZyL5aSn6Zm4'
        event.reply(msg)
      }
    }

    console.log(msg)
  } catch (error) {
    // msg = '發生錯誤!'
    event.reply(msgE)
  }
  // event.reply(msg)
})

// 在 port 啟動， '/' 為根目錄
bot.listen('/', process.env.PORT, () => {
  console.log('機器人已啟動')
})

// 重複你的話(打法)
// bot.on('message', event=> {
//   if(event.message.type === 'text'){
//     event.reply(event.message.text)
//   }
// })

// 今日 x 太多不做 -> (改做推播 7:00 12:30)
// 指定看第幾篇 () ex. 1s 2s 3s 4s...
// 最新3篇(n3/N3)
// 區域今天全部 (國家/歐洲) "把國家的抓下來JSON抓下來丟進 新陣列裡，陣列裡就有全部該國的資料，msg 若使用者只輸入 國家名，只丟出該國前三則新聞，若沒有資訊，則msg=7天內僅有上述資訊，
// 其他例如輸入：美國 1-5、6-10 (若超過資訊時，7天內僅有上述資訊)
