const WebSocketServer = require('ws').Server
const marketAPI = require('./main')
const axios = require('axios').default

const wss = new WebSocketServer({ port: 5031 })
var connections = []

var allPrices = {}
var favPrices = {}

const sortObj = (unordered) => {
  if (typeof unordered === 'object') {
    const ordered = Object.keys(unordered)
      .sort()
      .reduce((obj, key) => {
        obj[key] = unordered[key]
        return obj
      }, {})
    return ordered
  } else {
    return unordered
  }
}

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data)
  })
  ws.on('close', (ws) => {
    const index = connections.indexOf(ws)
    if (index > -1) {
      connections.splice(index, 1)
    }
  })
  connections.push(ws)
})

setTimeout(() => {
  favPrices = sortObj(favPrices)
  allPrices = sortObj(allPrices)
}, 20000)

setInterval(() => {
  let title = Object.values(favPrices)
    .map((s) => String(s).substring(0, 7))
    .join(' ')
  let params = {
    Title: title,
    Favourite: favPrices,
    All: allPrices,
  }
  console.log(params)
  connections.forEach((con) => {
    con.send(JSON.stringify(params, null, 4))
  })
}, 4000)

const favTokensTradingView = [
  { symbol: 'btcusdt', filter: 'crypto' },
  { symbol: 'xauusd', filter: '' },
]

const tokensTradingView = [
  { symbol: 'icpusdt', filter: 'crypto' },
  { symbol: 'maticusdt', filter: 'crypto' },
  { symbol: 'c98usdt', filter: 'crypto' },
  { symbol: 'bnbusdt', filter: 'crypto' },
  { symbol: 'linkusdt', filter: 'crypto' },
  { symbol: 'tlmusdt', filter: 'crypto' },
]

const tokensPancakeSwap = [
  { name: 'gst', contract: '0x7edc0ec89f987ecd85617b891c44fe462a325869' },
  { name: 'try', contract: '0x75d107de2217ffe2cd574a1b3297c70c8fafd159' },
  { name: 'wana', contract: '0x339c72829ab7dd45c3c52f965e7abe358dd8761e' },
  { name: 'raca', contract: '0x12bb890508c125661e03b09ec06e404bc9289040' },
  { name: 'myra', contract: '0x6ef238e9e8cd2a96740897761c18894fc086b9d0' },
]

/**
 * MARK
 * Trading View
 */
const market = marketAPI()
market.on('logged', () => {
  const subToken = async (token) => {
    const searchRes = await market.search(token.symbol, token.filter)
    if (Array.isArray(searchRes) && searchRes.length !== 0) {
      const result = searchRes[0]
      console.log('Found:', result)
      market.subscribe(result.id)
    }
  }

  tokensTradingView.forEach((token) => {
    subToken(token)
  })
  favTokensTradingView.forEach((token) => {
    subToken(token)
  })
})

market.on('price', (data) => {
  let symbol = String(data.symbol)
  let isPin = false
  favTokensTradingView.forEach((token) => {
    if (symbol.toLowerCase().indexOf(token.symbol) !== -1) {
      isPin = true
    }
  })
  if (isPin) {
    favPrices[String(data.symbol).replace(':', '_')] = String(data.price).substring(0, 10)
  }
  allPrices[String(data.symbol).replace(':', '_')] = String(data.price).substring(0, 10)
})

/**
 * MARK
 * Pancake swap
 */
const getPriceTokens = () => {
  tokensPancakeSwap.forEach(async (token) => {
    try {
      let addr = token.contract
      let res = await axios.get(`https://api.pancakeswap.info/api/v2/tokens/${addr}`)
      let data = res.data['data']
      if (data && data['symbol'] && data['price']) {
        allPrices['PANCAKE_' + String(data['symbol'])] = String(data['price']).substring(0, 10)
      }
    } catch (err) {
      console.log('Error Axios - Maybe no internet connection')
    }
  })
}

setInterval(getPriceTokens, 4000)
