// 引用 linebot套件
import linebot from 'linebot'
// 引用 doyenv 套件
import dotenv from 'dotenv'
// 引用 request 套件
import rp from 'request-promise'
// 引用 Node-Schedule 套件
import schedule from 'node-schedule'
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

// * api 內文整理
// 正則去掉所有的html標記
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
// * 訊息接收整理
// 第幾則、指定國家/洲
const order = (str) => {
  return str.replace(/s|S/g, '')
}
// 區間數量
const interval = (str) => {
  return str.replace(/-/g, '')
}
// 全域搜尋
const all = (str) => {
  return str.replace(/g|G/g, '')
}
// 日期判斷用
const dayif = (str) => {
  return str.replace(/@/g, '')
}
// 日期目錄 . -> - 抓相同日期用
const day = (str) => {
  return str.replace(/@/g, '-')
}
// 只留下數字
const number = (str) => {
  return str.replace(/\D/g, '')
}

// const data = await rp({ uri: 'https://www.trade.gov.tw/Api/Get/pages?nodeid=45&timeRestrict=true', json: true })

// let data = {}
// const getData = async () => {
//   data = await rp({ uri: 'https://www.trade.gov.tw/Api/Get/pages?nodeid=45&timeRestrict=true', json: true })
//   console.log('1分鐘')
//   console.log(data[0].PagePublishTime)
// }
// getData()
// schedule.scheduleJob('* 55 * * * *', getData())

const msgE = '程式或指令發生錯誤！指令可以輸入 f 查詢唷😊\n若指令確認無誤就是本地球村發生問題啦💦'

// 當收到訊息時
bot.on('message', async (event) => {
  // TODO 圖文按鈕(歐洲/美洲/中東/亞太/最新3則/功能查詢)
  // TODO 做 推播3則 7:00 12:30
  try {
    // 抓API回復
    // const data = await rp({ uri: 'https://www.trade.gov.tw/Api/Get/pages?nodeid=45&timeRestrict=true', json: true })
    // msg 回傳訊息，用陣列是可以分開對話框訊息
    const msg = ['', '']
    const date = new Date()
    let use = event.message.text

    if (use === 'new' || use === 'NEW' || use === 'New') {
      // *最新3篇 OK
      for (let i = 0; i < 3; i++) {
        if (i === 2) {
          msg[i] = `第 ${i + 1} 則\n台灣時間：${delLine(delT(data[i].PagePublishTime))}\n地區：${delDot(data[i].PageSummary)}\n⭐ 最新消息\n${data[i].PageTitle}\n\n📨 主要內容\n${delSpace(delHtmlTag(data[i].PageContent))}\n消息來源皆自：\n經濟部國際貿易局 經貿資訊網\nhttps://www.trade.gov.tw/World/List.aspx?code=7020&nodeID=45&areaID=4&country=b645Lit5ZyL5aSn6Zm4`
          event.reply(msg)
        }
        msg[i] = `第 ${i + 1} 則\n台灣時間：${delLine(delT(data[i].PagePublishTime))}\n地區：${delDot(data[i].PageSummary)}\n⭐ 最新消息\n${data[i].PageTitle}\n\n📨 主要內容\n${delSpace(delHtmlTag(data[i].PageContent))}`
      }
    } else if (!isNaN(order(use)) && order(use) <= data.length && (use.includes('s') || use.includes('S'))) {
      // *看第S篇 OK
      msg[0] = `第 ${order(use)} 則\n台灣時間：${delLine(delT(data[order(use) - 1].PagePublishTime))}\n地區：${delDot(data[order(use) - 1].PageSummary)}\n⭐ 最新消息\n${data[order(use) - 1].PageTitle}\n\n📨 主要內容\n${delSpace(delHtmlTag(data[order(use) - 1].PageContent))}\n消息來源皆自：\n經濟部國際貿易局 經貿資訊網\nhttps://www.trade.gov.tw/World/List.aspx?code=7020&nodeID=45&areaID=4&country=b645Lit5ZyL5aSn6Zm4`
      event.reply(msg[0])
    } else if (!isNaN(order(use)) && (order(use) > data.length || order(use) < 1) && (use.includes('s') || use.includes('S'))) {
      // 看第S篇 超過資料範圍 OK
      msg[0] = `7 天內目前共有 ${data.length} 則消息唷，請再次輸入於範圍內搜尋🌞，例如：s${data.length}`
      event.reply(msg[0])
    } else if (!isNaN(interval(use)) && use.includes('-')) {
      // *指定區間 - OK
      // 把 use 轉成陣列
      use = use.split('-')
      console.log(`${use[0]}-${use[1]}`)
      if ((use[0] - use[1]) > 0) {
        msg[0] = '第二個數字要比第一個數字大啦～ 不然 本地球村民 不會找啦🤭，例如:11-15'
        event.reply(msg[0])
      } else if ((use[1] - use[0]) > 4) {
        msg[0] = '最多只能發送五則消息唷😊！\n例如：6-10'
        event.reply(msg[0])
      } else if (use[0] > data.length || use[1] > data.length || use[0] < 1) {
        // 超過搜尋範圍
        msg[0] = '超出搜尋範圍啦💆‍♂！可以先查看目錄總共有幾則消息唷！\n目錄查詢請輸入 c'
        event.reply(msg[0])
        // 符合條件執行
      } else if ((use[0] - use[1]) < 0) {
        // count 為 設定 msg 的排序
        let count = -1
        for (let i = (use[0] - 1); i < use[1]; i++) {
          count = count + 1
          if (i === (use[1] - 1)) {
            msg[count] = `第 ${i + 1} 則\n台灣時間：${delLine(delT(data[i].PagePublishTime))}\n地區：${delDot(data[i].PageSummary)}\n⭐ 最新消息\n${data[i].PageTitle}\n\n📨 主要內容\n${delSpace(delHtmlTag(data[i].PageContent))}\n消息來源皆自：\n經濟部國際貿易局 經貿資訊網\nhttps://www.trade.gov.tw/World/List.aspx?code=7020&nodeID=45&areaID=4&country=b645Lit5ZyL5aSn6Zm4`
            event.reply(msg)
          }
          msg[count] = `第 ${i + 1} 則\n台灣時間：${delLine(delT(data[i].PagePublishTime))}\n地區：${delDot(data[i].PageSummary)}\n⭐ 最新消息\n${data[i].PageTitle}\n\n📨 主要內容\n${delSpace(delHtmlTag(data[i].PageContent))}`
        }
      }
    } else if ((use === '目錄' || use === 'c' || use === 'C')) {
      // *呼叫目錄 c OK
      // 超出目錄範圍
      if (number(use) > 4 || number(use) === 0) {
        msg[0] = '💡超出目錄的搜尋範圍囉，目錄共分為1-4區，例如：c2'
        event.reply(msg[0])
      } else {
        // 總數分四段，且無條件捨去
        const divide4 = Math.floor((data.length / 4))
        for (let i = 0; i < data.length; i++) {
          // 第一區目錄
          if (i < divide4) {
            if (i === 0) {
              msg[0] = `第 1 區目錄 📚1 - ${divide4}\n`
              msg[0] += `s${i + 1}：${data[i].PageTitle}\n`
            } else if (i === divide4 - 1) {
              msg[0] += `s${i + 1}：${data[i].PageTitle}`
            }
            msg[0] += `s${i + 1}：${data[i].PageTitle}\n`
          }
          // 第二區目錄
          if (i >= divide4 && i < (divide4 * 2)) {
            if (i === divide4) {
              msg[1] = `第 2 區目錄 📚${divide4 + 1} - ${divide4 * 2}\n`
              msg[1] += `s${i + 1}：${data[i].PageTitle}\n`
            } else if (i === (divide4 * 2) - 1) {
              msg[1] += `s${i + 1}：${data[i].PageTitle}`
            }
            msg[1] += `s${i + 1}：${data[i].PageTitle}\n`
          }
          // 第三區目錄
          if (i >= (divide4 * 2) && i < (divide4 * 3)) {
            if (i === (divide4 * 2)) {
              msg[2] = `第 3 區目錄 📚${divide4 * 2 + 1} - ${divide4 * 3}\n`
              msg[2] += `s${i + 1}：${data[i].PageTitle}\n`
            } else if (i === (divide4 * 3) - 1) {
              msg[2] += `s${i + 1}：${data[i].PageTitle}`
            }
            msg[2] += `s${i + 1}：${data[i].PageTitle}\n`
          }
          // 第四區目錄 要跑到(總長度-1)
          if (i >= (divide4 * 3) && i < data.length) {
            if (i === (divide4 * 3)) {
              msg[3] = `第 4 區目錄 📚${divide4 * 3} - ${data.length}\n`
              msg[3] += `s${i + 1}：${data[i].PageTitle}\n`
            } else if (i === data.length - 1) {
              msg[3] += `s${i + 1}：${data[i].PageTitle}`
              event.reply(msg)
            }
            msg[3] += `s${i + 1}：${data[i].PageTitle}\n`
          }
        }
      }
    } else if (isNaN(order(use)) && (use.includes('s') || use.includes('S'))) {
      // *找國家、洲目錄 s國家/洲/地區 OK
      for (let i = 0; i < data.length; i++) {
        // 確認國家
        msg[0] = `📍 ${order(use)}\n請再輸入對應的指定代號，即可查看內容🔍`
        if (i === data.length - 1) {
          if (data[i].PageSummary.includes(order(use))) {
            msg[1] += `s${i + 1}：${data[i].PageTitle}\n`
          } else if (msg[1] === '') {
            msg[1] = `7天內沒有 "${order(use)}" 的消息，請再嘗試搜尋別的地區🚀\n例如：s歐洲`
          }
          event.reply(msg)
        }
        if (data[i].PageSummary.includes(order(use))) {
          msg[1] += `s${i + 1}：${data[i].PageTitle}\n`
        }
      }
    } else if (isNaN(all(use)) && (use.includes('g') || use.includes('G'))) {
      // *找國家、洲相關目錄(標題&國家皆搜尋,全域搜尋) g ok
      msg[0] = `有關 🌎 ${all(use)} 的所有資訊\n請再輸入對應的指定代號，即可查看內容🔍`
      for (let i = 0; i < data.length; i++) {
        if (i === data.length - 1) {
          if (data[i].PageTitle.includes(all(use)) || data[i].PageSummary.includes(all(use))) {
            msg[1] += `s${i + 1}：${data[i].PageTitle}\n`
          } else if (msg[1] === '') {
            msg[1] = `7天內沒有 "${all(use)}" 的相關消息，請再嘗試搜尋別的地區🚀\n例如：g以色列`
          }
          event.reply(msg)
        }
        if (data[i].PageTitle.includes(all(use)) || data[i].PageSummary.includes(all(use))) {
          msg[1] += `s${i + 1}：${data[i].PageTitle}\n`
        }
      }
    } else if (!isNaN(dayif(use)) && (use.includes('@') || use.includes('＠'))) {
      // *找日期，顯示為那天標題目錄 @ OK
      const textTime = use.split('@')
      msg[0] = `🗓 ${textTime[0]}月${textTime[1]}日 `
      for (let i = 0; i < data.length; i++) {
        if (i === data.length - 1) {
          if (data[i].PagePublishTime.includes(day(use))) {
            msg[1] += `s${i + 1}：${data[i].PageTitle}\n`
          }
          if (msg[1] === '') {
            msg[1] = '只能查詢7天內發布的消息唷✨'
          }
          event.reply(msg)
        }
        if (data[i].PagePublishTime.includes(day(use))) {
          msg[1] += `s${i + 1}：${data[i].PageTitle}\n`
        }
      }
    } else if (use === 'today' || use === '今天' || use === '今日') {
      // *找今天，today OK
      const today = `${date.getMonth() + 1}-${date.getDate()}`
      msg[0] = `🗓 ${date.getMonth() + 1}月${date.getDate()}日\n`

      for (let i = 0; i < data.length; i++) {
        if (i === data.length - 1) {
          if (data[i].PagePublishTime.includes(today)) {
            msg[1] += `s${i + 1}：${data[i].PageTitle}\n`
          }
          event.reply(msg)
        }
        if (data[i].PagePublishTime.includes(today)) {
          msg[1] += `s${i + 1}：${data[i].PageTitle}\n`
        }
      }
    } else if (use === '?' || use === '功能' || use === 'f') {
      // *功能(名稱排版) ?
      event.reply(`功能(名稱)\n🧱 最新發布消息(至多5則)：n + 數字，例如：n3\n🧱 指定第幾則消息：s + 數字，例如：s10\n\n🧱 所有消息目錄：c\n\n🧱 指定地區的所有消息目錄：s + 國家(或地區)，例如：s非洲\n🧱 指定地區的{所有相關}消息目錄：g + 國家(或地區)，例如：g中東\n🧱 今日的消息目錄：today\n🧱 該日期的消息目錄：月@日，例如：5@22\n\n🧱 功能查詢(名稱分類)：?\n🧱 功能查詢(指令分類)：?c\n\np.s.亞洲請打"亞太"或"亞太地區"\n開始試試看吧😊！
      `)
    } else if (use === '?c' || use === '功能c' || use === 'fc' || use === '?C' || use === '功能C' || use === 'fC' || use === 'Fc' || use === 'FC') {
      // *功能(指令排版) ?c
      event.reply(`功能(指令)\n🧱 n + 數字：查詢"最新發布消息"(至多5則) 例如：n3\n🧱 s + 數字：指定"第幾則消息" 例如：s10 \n🧱 s + 國家(或地區)：查詢"指定地區的消息標題目錄" 例如：s非洲\n🧱 g + 國家(或地區)：查詢"指定地區的{所有相關}消息標題目錄" 例如：g中東\n🧱 c：叫出所有消息標題目錄 \n🧱 today：查詢"今日的消息標題目錄"\n🧱 月@日：查詢"該日期的消息標題目錄" 例如：5@22\n🧱 ?：功能查詢(名稱分類) \n🧱 ?c：功能查詢(指令分類) \n\np.s.亞洲請打"亞太"或"亞太地區"\n開始試試看吧😊！
      `)
    } else {
      msg[0] = '我好像看不懂啊...你是想跟我聊天嗎?👼(不過本地球村民還沒學會與你在雲上聊天☁...)\n或者請你輸入正確指令，不清楚可輸入 f 查看，\n或是到 經濟部國際貿易局 經貿資訊網搜詢相關資訊：\nhttps://www.trade.gov.tw/World/List.aspx?code=7020&nodeID=45&areaID=4&country=b645Lit5ZyL5aSn6Zm4'
      event.reply(msg[0])
    }

    console.log(msg)
  } catch (error) {
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
