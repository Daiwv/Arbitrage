/**
 * @name LIB-ABCC
 * @desc  signup and auto trading for abcc init mining
 */
'use strict'

const debug = require('debug')('core:abcc')
const log = require('../utils.js').log
const puppeteer = require('puppeteer')
const math = require('mathjs')

const typeMaxTry = 10

const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
const viewWidth = 1920
const viewHeight = 1080

const loginURL = 'https://abcc.com/signin'
const loginUsernameSelector = '#form > div.input-wrap > div:nth-child(3) > input[type="email"]'
const loginPasswordSelector = '#form > div.input-wrap > div:nth-child(4) > input[type="password"]'
const loginButtonSelector = '#submit > button'
const loginConfirmSelector = 'body > div.profile-page > div.content-section > div.content_menu > div > div > div.new-tabs-item.active'

const exchangeURL = 'https://abcc.com/markets'
const exchangeMarketSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.tab-title > div > div:nth-child(2) > span'
const exhangeMarketBuyNumSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form-market > div:nth-child(1) > div.input-label.input-item.input-total > input'
const exchangeMaketSellNumSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form-market > div:nth-child(2) > div.input-label.input-item.input-total > input'
const exchangeMarketBuyButtonSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form-market > div:nth-child(1) > button'
const exchangeMarketSellButtonSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form-market > div:nth-child(2) > button'
const exchangeMarketBuyErroSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form-market > div:nth-child(1) > div.input-label.input-item.input-total > span.error.label'
const exchangeMarketSellErroSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form-market > div:nth-child(2) > div.input-label.input-item.input-total > span.error.label'

const exchangeLimitSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.tab-title > div > div:nth-child(1) > span'
const exchangePriceSelector = 'body > div.exchange-page.body > div.content > div.item.left > div > div.depth-table-ct > div > div > p > span:nth-child(1)'
const exchangeAskSelector = 'body > div.exchange-page.body > div.content > div.item.left > div > div.depth-table-ct > div > table:nth-child(1) > tbody' // sell
const exchangeBitSelector = 'body > div.exchange-page.body > div.content > div.item.left > div > div.depth-table-ct > div > table:nth-child(3) > tbody' // buy
const exchangeBuyPriceSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form > div:nth-child(1) > div:nth-child(2) > input'
const exchangeBuyNumSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form > div:nth-child(1) > div.input-label.input-item.input-amout > input'
const exchangeBuyButtonSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form > div:nth-child(1) > button'
const exchangeBuyAllSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form > div:nth-child(1) > div.percent > span:nth-child(4)'
const exchangeBuyErroSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form > div:nth-child(1) > div.input-label.input-item.input-amout > span.error.label'
const exchangeSellPriceSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form > div:nth-child(2) > div:nth-child(2) > input'
const exchangeSellNumSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form > div:nth-child(2) > div.input-label.input-item.input-amout > input'
const exchangeSellButtonSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form > div:nth-child(2) > button > span'
const exchangeSellAllSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form > div:nth-child(2) > div.percent > span:nth-child(4)'
const exchangeSellErroSelector = 'body > div.exchange-page.body > div.content > div.item.center > div.center-bottom > div.order-submit.order-form > div:nth-child(2) > div.input-label.input-item.input-amout > span.error.label'

const revokeURL = 'https://abcc.com/history/orders/#/open-orders'
const revokeButtonSelector = '.btn.el-popover__reference'
const revokeButtonConfirmSelector = '.btn.ok'

const propertyURL = 'https://abcc.com/funds#/'

const historyURL = 'https://abcc.com/history/orders#/'
const historyRefreshSelector = 'body > div.order-page > div.content-section.clearfix > div.history-order_page > div.filters.fb > div.btn-group > div:nth-child(1) > button'
const historyFirstRowSelector = 'body > div.order-page > div.content-section.clearfix > div.history-order_page > div.el-table.historyorder_el-table.el-table--fit.el-table--striped.el-table--enable-row-hover.el-table--enable-row-transition > div.el-table__body-wrapper.is-scrolling-none > table > tbody > tr:nth-child(1)'
const historySecondRowSelector = 'body > div.order-page > div.content-section.clearfix > div.history-order_page > div.el-table.historyorder_el-table.el-table--fit.el-table--striped.el-table--enable-row-hover.el-table--enable-row-transition > div.el-table__body-wrapper.is-scrolling-none > table > tbody > tr:nth-child(2)'

async function sleep (millis) {
  await debug('sleep is called')
  return new Promise((resolve) => setTimeout(resolve, millis))
}

async function init () {
  await debug('init function is called')
  let options = await {
    headless: false,
    slowMo: 5,
    // executablePath: './chrome-win32/chrome.exe',
    args: [
      // '--auto-open-devtools-for-tabs',
      '--proxy-server=socks5://127.0.0.1:1080',
      '--start-maximized',
      '--disable-infobars'
    ]
  }
  let browser = await puppeteer.launch(options)
  await debug('init function is done')
  await log('// SUCCEED //: Init function: done, browser obj has been returned after puppeteer launched (options:' + JSON.stringify(options) + ')')
  return browser
}

async function muteInit () {
  await debug('muteInit function is called')
  let options = await {
    headless: true,
    slowMo: 5,
    // executablePath: './chrome-win32/chrome.exe',
    args: [
      // '--auto-open-devtools-for-tabs',
      // '--proxy-server=socks5://127.0.0.1:1080',
      '--start-maximized',
      '--disable-infobars'
    ]
  }
  let browser = await puppeteer.launch(options)
  await debug('muteInit function is done')
  await log('// SUCCEED //: muteInit function: done, browser obj has been returned after puppeteer launched (options:' + JSON.stringify(options) + ')')
  return browser
}

async function login (browser, username, password) {
  await debug('login function is called')
  let pageLogin = await browser.newPage()
  await pageLogin.setUserAgent(userAgent)
  await pageLogin.setViewport({
    width: viewWidth,
    height: viewHeight
  })
  // get login by user first
  try {
    await pageLogin.goto(loginURL, {
      timeout: 30000,
      waitUntil: 'load'
    })
  } catch (err) {
    await debug('// WARNING //: login page load timeout')
    await log('// WARNING //: Login function: undone, login page load timeout')
  }
  await pageLogin.waitForSelector(loginButtonSelector, {
    timeout: 0
  })
  try {
    await pageLogin.type(loginUsernameSelector, username, {delay: 10})
    await pageLogin.type(loginPasswordSelector, password, {delay: 10})
    await pageLogin.click(loginButtonSelector)
  } catch (err) {
    await debug('// ERROR //: type in login page failed')
    await log('// ERROR //: Login function: undone, type in login page failed')
  }
  await pageLogin.waitForSelector(loginConfirmSelector, {
    timeout: 0
  })
  await debug('// SUCCEED //: login function is done')
  await log('// SUCCEED //: Login function: done, login at user:' + username + ', password: ******')
  return pageLogin
}

async function muteLogin (browser, username, password, readlineSync) {
  await debug('login function is called')
  let pageLogin = await browser.newPage()
  await pageLogin.setUserAgent(userAgent)
  await pageLogin.setViewport({
    width: viewWidth,
    height: viewHeight
  })
  // get login by user first
  try {
    await pageLogin.goto(loginURL, {
      timeout: 30000,
      waitUntil: 'load'
    })
  } catch (err) {
    await debug('// WARNING //: login page load timeout')
    await log('// WARNING //: Login function: undone, login page load timeout')
  }
  await pageLogin.waitForSelector(loginButtonSelector, {
    timeout: 0
  })
  try {
    await pageLogin.type(loginUsernameSelector, username, {delay: 10})
    await pageLogin.type(loginPasswordSelector, password, {delay: 10})
    await pageLogin.click(loginButtonSelector)
  } catch (err) {
    await debug('// ERROR //: type in login page failed')
    await log('// ERROR //: Login function: undone, type in login page failed')
  }
  await pageLogin.waitForSelector(loginConfirmSelector, {
    timeout: 0
  })
  await debug('// SUCCEED //: login function is done')
  await log('// SUCCEED //: Login function: done, login at user:' + username + ', password: ******')
  return pageLogin
}

async function openProperty (browser) {
  await debug('openProperty function is called')
  // before auto trade
  const pageProperty = await browser.newPage()
  await pageProperty.setUserAgent(userAgent)
  await pageProperty.setViewport({
    width: viewWidth,
    height: viewHeight
  })
  try {
    await pageProperty.goto(propertyURL, {
      timeout: 30000,
      waitUntil: 'load'
    })
  } catch (err) {
    await debug('// WARNING //: property page load timeout')
    await log('// WARNING //: openProperty function: undone, property page load timeout')
  }
  await log('// SUCCEED //: openProperty function: done, pageProperty obj returned')
  return pageProperty
}

async function openRevoke (browser) {
  await debug('openRevoke function is called')
  // before auto trade
  const pageRevoke = await browser.newPage()
  await pageRevoke.setUserAgent(userAgent)
  await pageRevoke.setViewport({
    width: viewWidth,
    height: viewHeight
  })
  try {
    await pageRevoke.goto(revokeURL, {
      timeout: 30000,
      waitUntil: 'load'
    })
  } catch (err) {
    await debug('// WARNING //: revoke page load timeout')
    await log('// WARNING //: openRevoke function: undone, revoke page load timeout')
  }
  await log('// SUCCEED //: openRevoke function: done, pageRevoke obj returned')
  return pageRevoke
}

async function openHistory (browser) {
  await debug('openHistory function is called')
  // before auto trade
  const pageRevoke = await browser.newPage()
  await pageRevoke.setUserAgent(userAgent)
  await pageRevoke.setViewport({
    width: viewWidth,
    height: viewHeight
  })
  try {
    await pageRevoke.goto(historyURL, {
      timeout: 30000,
      waitUntil: 'load'
    })
  } catch (err) {
    await debug('// WARNING //: history page load timeout')
    await log('// WARNING //: openHistory function: undone, revoke page load timeout')
  }
  await log('// SUCCEED //: openHistory function: done, pageRevoke obj returned')
  return pageRevoke
}

async function openExchange (browser, symbols) {
  await debug('openExchange function is called')
  // before auto trade
  const pageExchange = await browser.newPage()
  await pageExchange.setUserAgent(userAgent)
  await pageExchange.setViewport({
    width: viewWidth,
    height: viewHeight
  })
  try {
    await pageExchange.goto(exchangeURL + '/' + symbols, {
      timeout: 30000,
      waitUntil: 'load'
    })
  } catch (err) {
    await debug('// WARNING //: exchange page load timeout')
    await log('// WARNING //: openExchange function: undone, exchange page load timeout')
  }
  await log('// SUCCEED //: openExchange function: done, pageExchange obj returned (with symbols: ' + symbols + ')')
  return pageExchange
}

async function checkTradeLoadHistory (pageHistory) {
  await debug('checkTadeLoadHistory function is called')
  while (pageHistory.$(historyRefreshSelector) === null) {
    await pageHistory.reload({
      timeout: 30000,
      waitUntil: 'load'
    })
  }
  await pageHistory.click(historyRefreshSelector)
}

async function getFirstTradeHistory (pageHistory) {
  await debug('getFirstTradeHistory function is called')
  await checkTradeLoadHistory(pageHistory)
  let row = await pageHistory.$eval(historyFirstRowSelector, (heading) => {
    return (heading.innerText).split(/\n/)
  })
  let tradeObj
  try {
    tradeObj = {
      time: row[0],
      symbols: row[1],
      type: row[2],
      direction: row[3],
      price: row[4],
      num: row[5],
      donePrice: row[6],
      doneNum: row[7],
      doneMoney: row[8],
      result: row[9]
    }
  } catch (err) {
    await debug('// WARNING //: getFirstTradeHistory function: undone')
    await log('// WARNING //: getFirstTradeHistory function: undone')
    return false
  }
  await debug('// SUCCEED //: getFirstTradeHistory function: done')
  await log('// SUCCEED //: getFirstTradeHistory function: done')
  return tradeObj
}

async function getSecondTradeHistory (pageHistory) {
  await debug('getSecondTradeHistory function is called')
  await checkTradeLoadHistory(pageHistory)
  let row = await pageHistory.$eval(historySecondRowSelector, (heading) => {
    return (heading.innerText).split(/\n/)
  })
  let tradeObj
  try {
    tradeObj = {
      time: row[0],
      symbols: row[1],
      type: row[2],
      direction: row[3] === '卖' ? 1 : -1,
      price: row[4],
      num: row[5],
      donePrice: row[6],
      doneNum: row[7],
      doneMoney: row[8],
      result: row[9]
    }
  } catch (err) {
    await debug('// WARNING //: getSecondTradeHistory function: undone')
    await log('// WARNING //: getSecondTradeHistory function: undone')
    return false
  }
  await debug('// SUCCEED //: getSecondTradeHistory function: done')
  await log('// SUCCEED //: getSecondTradeHistory function: done')
  return tradeObj
}

async function checkLimitLoadExchange (pageExchange) {
  await debug('checkLimitLoadExchange function is called')
  while (pageExchange.$(exchangeLimitSelector) === null) {
    await pageExchange.reload({
      timeout: 30000,
      waitUntil: 'load'
    })
  }
  await pageExchange.waitForSelector(exchangePriceSelector)
  await pageExchange.waitForSelector(exchangeAskSelector)
  await pageExchange.waitForSelector(exchangeBitSelector)
  await pageExchange.waitForSelector(exchangeBuyPriceSelector)
  await pageExchange.waitForSelector(exchangeBuyNumSelector)
  await pageExchange.waitForSelector(exchangeSellPriceSelector)
  await pageExchange.waitForSelector(exchangeSellNumSelector)
  await log('// SUCCEED //: checkLimitLoadExchange function: done')
}

async function checkMarketLoadExchange (pageExchange) {
  await debug('checkMarketLoadExchange function is called')
  while (pageExchange.$(exchangeMarketSelector) === null) {
    await pageExchange.reload({
      timeout: 30000,
      waitUntil: 'load'
    })
    await sleep(1000)
  }
  await log('// SUCCEED //: checkMarketLoadExchange function: done')
}

async function getNowPriceExchange (pageExchange) {
  await debug('getNowPriceExchange function is called')
  // check loading
  await checkLimitLoadExchange(pageExchange)
  // get now price
  let nowPrice = await pageExchange.$eval(exchangePriceSelector, (heading) => {
    return parseFloat(heading.textContent)
  })
  await debug('nowPrice: ' + nowPrice) // should be num
  await log('// SUCCEED //: getNowPriceExchange function: done, return nowPrice:' + nowPrice)
  return nowPrice
}

async function getBoxExchange (pageExchange) {
  await debug('getBoxExchange function is called')
  // check loading
  await pageExchange.bringToFront()
  await checkLimitLoadExchange(pageExchange)
  // get now price
  let nowPrice = await pageExchange.$eval(exchangePriceSelector, (heading) => {
    return parseFloat(heading.textContent)
  })
  await debug('nowPrice: ' + nowPrice) // should be num
  // get ask box prices (for sell)
  let askPriceBoxHandle = await pageExchange.$eval(exchangeAskSelector, (heading) => {
    return heading.textContent
  }).then((value) => {
    debug(value)
    return value.split(/\s+/)
  })
  await debug('askPriceBoxHandle ( type: ' + typeof (askPriceBoxHandle) + '，length: ' + askPriceBoxHandle.length + ' ) value: \n' + askPriceBoxHandle)
  let askBoxLength = math.floor((askPriceBoxHandle.length - 1) / 3)
  let askBoxPrice = []
  let askBoxNum = []
  let askBoxMoney = []
  for (let i = 0; i < askBoxLength; i++) {
    askBoxPrice[askBoxLength - 1 - i] = parseFloat(askPriceBoxHandle[i * 3]) > 0 ? parseFloat(askPriceBoxHandle[i * 3]) : 0
    askBoxNum[askBoxLength - 1 - i] = parseFloat(askPriceBoxHandle[i * 3 + 1]) > 0 ? parseFloat(askPriceBoxHandle[i * 3 + 1]) : 0
    askBoxMoney[askBoxLength - 1 - i] = parseFloat(askPriceBoxHandle[i * 3 + 2]) > 0 ? parseFloat(askPriceBoxHandle[i * 3 + 2]) : 0
  }
  // get bit box price (for buy)
  let bitPriceBoxHandle = await pageExchange.$eval(exchangeBitSelector, (heading) => {
    return heading.textContent
  }).then((value) => {
    debug(value)
    return value.split(/\s+/)
  })
  await debug('bitPriceBoxHandle ( type: ' + typeof (bitPriceBoxHandle) + '，length: ' + bitPriceBoxHandle.length + ' ) value: \n' + bitPriceBoxHandle)
  let bitBoxLength = math.floor((bitPriceBoxHandle.length - 1) / 3)
  let bitBoxPrice = []
  let bitBoxNum = []
  let bitBoxMoney = []
  for (let i = 0; i < bitBoxLength; i++) {
    bitBoxPrice[i] = parseFloat(bitPriceBoxHandle[i * 3]) > 0 ? parseFloat(bitPriceBoxHandle[i * 3]) : 0
    bitBoxNum[i] = parseFloat(bitPriceBoxHandle[i * 3 + 1]) > 0 ? parseFloat(bitPriceBoxHandle[i * 3 + 1]) : 0
    bitBoxMoney[i] = parseFloat(bitPriceBoxHandle[i * 3 + 2]) > 0 ? parseFloat(bitPriceBoxHandle[i * 3 + 2]) : 0
  }
  let boxExchange = {
    sellBox: {
      sellPrice: askBoxPrice,
      sellNum: askBoxNum,
      sellMoney: askBoxMoney
    },
    nowPrice: nowPrice,
    buyBox: {
      buyPrice: bitBoxPrice,
      buyNum: bitBoxNum,
      buyMoney: bitBoxMoney
    }
  }
  await log('// SUCCEED //: getBoxExchange function: done, return boxExchange:' + JSON.stringify(boxExchange))
  return boxExchange
}

async function typeMarketExchange (pageExchange, typeNumSelector, typeNumStr) {
  await debug('typeMarketExchange function is called')
  // check loading
  checkMarketLoadExchange(pageExchange)
  await pageExchange.waitForSelector(typeNumSelector)
  // to be continue
  await log('// ERROR //: typeMarketExchange function: to be continue')
  return false
}

async function typeBuyMarketExchange (pageExchange, buyNum) {
  await debug('typeBuyMarketExchange function is called')
  // buy market
  let typeRes = typeMarketExchange(pageExchange, exhangeMarketBuyNumSelector, buyNum)
  await log('// ERROR //: typeBuyMarketExchange function: to be continue')
  return typeRes
}

async function typeSellMarketExchange (pageExchange, sellNum) {
  await debug('typeSellMarketExchange function is called')
  // sell market
  let typeRes = typeMarketExchange(pageExchange, exchangeMaketSellNumSelector, sellNum)
  await log('// ERROR //: typeSellMarketExchange function: to be continue')
  return typeRes
}

async function clickBuyMarketExchange (pageExchange) {
  await debug('clickBuyMarketExchange function is called')
  // click buy
  await pageExchange.click(exchangeMarketBuyButtonSelector)
  await log('// SUCCEED //: clickBuyMarketExchange function: done')
}

async function clickSellMarketExchange (pageExchange) {
  await debug('clickSellMarketExchange function is called')
  // click buy
  await pageExchange.click(exchangeMarketSellButtonSelector)
  await log('// SUCCEED //: clickSellMarketExchange function: done')
}

async function typeLimitExchange (pageExchange, typePriceSelector, typeNumSelector, typePriceStr, typeNumStr) {
  await debug('typeLimitExchange function is called')
  // check loading
  await checkLimitLoadExchange(pageExchange)
  // begin type
  let elementHandle
  let elementHandle1
  let typePrice
  let typeNum
  let candy = 0
  do {
    candy = candy + 1
    elementHandle = await pageExchange.$(typePriceSelector)
    await elementHandle.click()
    await elementHandle.focus()
    // click three times to select all
    await elementHandle.click({
      clickCount: 3
    })
    await elementHandle.press('Backspace')
    elementHandle1 = await pageExchange.$(typeNumSelector)
    await elementHandle1.click()
    await elementHandle1.focus()
    // click three times to select all
    await elementHandle1.click({
      clickCount: 3
    })
    await elementHandle1.press('Backspace')
    await elementHandle.type(typePriceStr, {delay: 10})
    await elementHandle1.type(typeNumStr, {delay: 10})
    typePrice = await pageExchange.$(typePriceSelector).then(async (ElementHandle) => {
      let value = await (await ElementHandle.getProperty('value')).jsonValue()
      await debug('current sell input price:' + value)
      return value
    })
    typeNum = await pageExchange.$(typeNumSelector).then(async (ElementHandle) => {
      let value = await (await ElementHandle.getProperty('value')).jsonValue()
      await debug('current sell input num:' + value)
      return value
    })
  } while ((typePriceStr !== typePrice || typeNumStr !== typeNum) && candy < typeMaxTry)
  if (typePriceStr === typePrice && typeNumStr === typeNum) {
    await log('// SUCCEED //: typeLimitExchange function: done, typePrice: ' + typePrice + ', typeNum: ' + typeNum)
    return true
  } else {
    await debug('// ERROR //: typeLimitExchange function: typeLimitExchange write error')
    await log('// ERROR //: typeLimitExchange function: typeLimitExchange write error')
    return false
  }
}

async function typeBuyLimitExchange (pageExchange, buyPrice, buyNum) {
  await debug('typeBuyLimitExchange function is called')
  // buy limit
  let typeRes = await typeLimitExchange(pageExchange, exchangeBuyPriceSelector, exchangeBuyNumSelector, buyPrice, buyNum)
  await log('// SUCCEED //: typeBuyLimitExchange function: done, buyPrice: ' + buyPrice + ', buyNum: ' + buyNum)
  return typeRes
}

async function typeSellLimitExchange (pageExchange, sellPrice, sellNum) {
  await debug('typeSellLimitExchange function is called')
  // sell limit
  let typeRes = await typeLimitExchange(pageExchange, exchangeSellPriceSelector, exchangeSellNumSelector, sellPrice, sellNum)
  await log('// SUCCEED //: typeBuyLimitExchange function: done, sellPrice: ' + sellPrice + ', sellNum: ' + sellNum)
  return typeRes
}

async function clickBuyLimitExchange (pageExchange) {
  await debug('clickBuyLimitExchange function is called')
  // click buy
  await pageExchange.click(exchangeBuyButtonSelector)
  await log('// SUCCEED //: clickBuyLimitExchange function: done')
}

async function clickSellLimitExchange (pageExchange) {
  await debug('clickSellLimitExchange function is called')
  // click buy
  await pageExchange.click(exchangeSellButtonSelector)
  await log('// SUCCEED //: clickSellLimitExchange function: done')
}

async function runArbitrageExchange (pageExchange, direction, price, num, pricePrecision, numPrecision) {
  await debug('runArbitrageExchange function is called')
  // run exchange
  let typePrice = await parseFloat(math.format(price, {notation: 'fixed', precision: pricePrecision}))
  let rand = math.random(-0.001, 0.001)
  let typeNum = await parseFloat(math.format(math.add(num, math.multiply(num, rand)), {notation: 'fixed', precision: numPrecision}))
  await debug('typeDirection: ' + direction + ', typePrice: ' + typePrice + ', typeNum: ' + typeNum)
  await log('typeDirection: ' + direction + ', typePrice: ' + typePrice + ', typeNum: ' + typeNum)

  await pageExchange.bringToFront()
  var typeRes = false
  if (direction > 0) { // sell
    typeRes = await typeSellLimitExchange(pageExchange, typePrice.toString(), typeNum.toString())
  } else if (direction < 0) { // buy
    typeRes = await typeBuyLimitExchange(pageExchange, typePrice.toString(), typeNum.toString())
  }
  await debug('typeRes: ' + typeRes)
  if (typeRes > 0) {
    await pageExchange.bringToFront()
    if (direction > 0) { // sell
      await clickSellLimitExchange(pageExchange)
    } else if (direction < 0) { // buy
      await clickBuyLimitExchange(pageExchange)
    }
    await debug('// SUCCEED //: runArbitrageExchange function: done')
    await log('// SUCCEED //: runArbitrageExchange function: done')
    return true
  } else {
    await debug('// ERROR //: runArbitrageExchange function: undone, type price or num error')
    await log('// ERROR //: runArbitrageExchange function: undone, type price or num error')
    return false
  }
}

async function runFastBuyArbitrageExchange (buyPageExchange, buyPageExchange1, sellPageExchange, buyPrice, buyNum, buyPricePrecision, buyNumPrecision, buyPrice1, buyNum1, buyPricePrecision1, buyNumPrecision1, sellPrice, sellNum, sellPricePrecision, sellNumPrecision) {
  await debug('runFastBuyArbitrageExchange function is called')
  var res = false
  res = await runArbitrageExchange(buyPageExchange, 1, buyPrice, buyNum, buyPricePrecision, buyNumPrecision)
  res = await res && await runArbitrageExchange(buyPageExchange1, 1, buyPrice1, buyNum1, buyPricePrecision1, buyNumPrecision1)
  res = await res && await runArbitrageExchange(sellPageExchange, -1, sellPrice, sellNum, sellPricePrecision, sellNumPrecision)
  return res
}

async function runFastSellArbitrageExchange (buyPageExchange, sellPageExchange, sellPageExchange1, buyPrice, buyNum, buyPricePrecision, buyNumPrecision, sellPrice, sellNum, sellPricePrecision, sellNumPrecision, sellPrice1, sellNum1, sellPricePrecision1, sellNumPrecision1, pricePrecision, numPrecision) {
  await debug('runFastSellArbitrageExchange function is called')
  var res = false
  res = await runArbitrageExchange(buyPageExchange, 1, buyPrice, buyNum, buyPricePrecision, buyNumPrecision)
  res = await res && await runArbitrageExchange(sellPageExchange, -1, sellPrice, sellNum, sellPricePrecision, sellNumPrecision)
  res = await res && await runArbitrageExchange(sellPageExchange, -1, sellPrice1, sellNum1, sellPricePrecision1, sellNumPrecision1)
  return res
}

async function runDefaultExchange (buyPageExchange, sellPageExchange, buyPrice, buyNum, sellPrice, sellNum, pricePrecision, numPrecision) {
  await debug('runDefaultExchange function is called')
  var res = await runExchange(buyPageExchange, sellPageExchange, buyPrice, buyNum, sellPrice, sellNum, pricePrecision, numPrecision)
  return res
}

async function runExchange (buyPageExchange, sellPageExchange, buyPrice, buyNum, sellPrice, sellNum, pricePrecision, numPrecision) {
  await debug('runExchange function is called')
  // run exchange
  let typeBuyPrice = await parseFloat(math.format(buyPrice, {notation: 'fixed', precision: pricePrecision}))
  let rand = math.random(-0.001, 0.001)
  let typeBuyNum = await parseFloat(math.format(math.add(buyNum, math.multiply(buyNum, rand)), {notation: 'fixed', precision: numPrecision}))
  let typeSellPrice = await parseFloat(math.format(sellPrice, {notation: 'fixed', precision: pricePrecision}))
  let typeSellNum = await parseFloat(math.format(math.add(sellNum, math.multiply(sellNum, rand)), {notation: 'fixed', precision: numPrecision}))
  await debug('typeBuyPrice: ' + typeBuyPrice + ', typeBuyNum: ' + typeBuyNum + ', typeSellPrice: ' + typeSellPrice + ', typeSellNum: ' + typeSellNum)
  await log('typeBuyPrice: ' + typeBuyPrice + ', typeBuyNum: ' + typeBuyNum + ', typeSellPrice: ' + typeSellPrice + ', typeSellNum: ' + typeSellNum)
  await buyPageExchange.bringToFront()
  var typeBuyRes = await typeBuyLimitExchange(buyPageExchange, typeBuyPrice.toString(), typeBuyNum.toString())
  await sellPageExchange.bringToFront()
  var typeSellRes = await typeSellLimitExchange(sellPageExchange, typeSellPrice.toString(), typeSellNum.toString())
  await debug('typeBuyRes: ' + typeBuyRes + ', typeSellRes: ' + typeSellRes)
  if (typeSellRes && typeBuyRes > 0) {
    await buyPageExchange.bringToFront()
    await clickBuyLimitExchange(buyPageExchange)
    await sellPageExchange.bringToFront()
    await clickSellLimitExchange(sellPageExchange)
    await debug('// SUCCEED //: runExchange function: done')
    await log('// SUCCEED //: runExchange function: done')
    return true
  } else {
    await debug('// ERROR //: runExchange function: undone, type price or num error')
    await log('// ERROR //: runExchange function: undone, type price or num error')
    return false
  }
}

async function runBuyAllExchange (pageExchange, boxExchange) {
  await debug('runBuyAllExchange function is called')
  // to be continue
  await log('// ERROR //: runBuyAllExchange function: to be continue')
  return false
}

async function runSellAllExchange (pageExchange, boxExchange) {
  await debug('runSellAllExchange function is called')
  // to be continue
  await log('// ERROR //: runSellAllExchange function: to be continue')
  return false
}

async function runRevoke (pageRevoke) {
  await debug('runRevoke function is called')
  await pageRevoke.bringToFront()
  while (pageRevoke.$(revokeButtonSelector) === null || pageRevoke.$(revokeButtonConfirmSelector) === null) {
    await pageRevoke.reload({
      timeout: 30000,
      waitUntil: 'load'
    })
    await sleep(1000)
  }
  // run revoke
  try {
    // await sleep(1000)
    // await pageRevoke.$eval(revokeButtonSelector, el => el.click())
    // await debug('revoke button click succeed')
    await sleep(1000)
    await pageRevoke.$eval(revokeButtonConfirmSelector, el => el.click())
    await debug('revoke confirm button click succeed')
    await debug('// SUCCEED //: runRevoke function is done')
    await log('// SUCCEED //: runRevoke function: done')
    return true
  } catch (err) {
    await debug('// ERROR //: revoke button click error')
    await log('// ERROR //: runRevoke function: undone, revoke button click error')
    return false
  }
}

module.exports.sleep = sleep
module.exports.init = init
module.exports.muteInit = muteInit
module.exports.login = login
module.exports.muteLogin = muteLogin
module.exports.openProperty = openProperty
module.exports.openRevoke = openRevoke
module.exports.openHistory = openHistory
module.exports.openExchange = openExchange
module.exports.getNowPriceExchange = getNowPriceExchange
module.exports.getBoxExchange = getBoxExchange
module.exports.typeBuyMarketExchange = typeBuyMarketExchange
module.exports.typeSellMarketExchange = typeSellMarketExchange
module.exports.clickBuyMarketExchange = clickBuyMarketExchange
module.exports.clickSellMarketExchange = clickSellMarketExchange
module.exports.typeBuyLimitExchange = typeBuyLimitExchange
module.exports.typeSellLimitExchange = typeSellLimitExchange
module.exports.clickBuyLimitExchange = clickBuyLimitExchange
module.exports.clickSellLimitExchange = clickSellLimitExchange
module.exports.runArbitrageExchange = runArbitrageExchange
module.exports.runFastBuyArbitrageExchange = runFastBuyArbitrageExchange
module.exports.runFastSellArbitrageExchange = runFastSellArbitrageExchange
module.exports.runDefaultExchange = runDefaultExchange
module.exports.runBuyAllExchange = runBuyAllExchange
module.exports.runSellAllExchange = runSellAllExchange
module.exports.runRevoke = runRevoke
