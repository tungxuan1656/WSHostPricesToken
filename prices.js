const WebSocketServer = require('ws').Server
// const marketAPI = require('./main')
const axios = require('axios').default
const MarketService = require('./main')

const wss = new WebSocketServer({ port: 5031 })
var connections = []

var prices = {}

const sortObj = (unordered) => {
  if (typeof unordered === 'object') {
    Object.keys(unordered).forEach((k) => {
      if (typeof unordered[k] === 'object') {
        unordered[k] = sortObj(unordered[k])
      }
    })
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
  prices = sortObj(prices)
}, 20000)

setInterval(() => {
  let title = Object.values(prices?.Favourite ?? {})
    .map((s) => String(s).substring(0, 7))
    .join(' ')
  let params = {
    Title: title,
    ...prices,
  }
  delete params.Favourite
  console.log(params)
  connections.forEach((con) => {
    con.send(JSON.stringify(params, null, 4))
  })
}, 4000)

const tokensList = {
  Favourite: [
    { symbol: 'btcusdt', filter: 'crypto' },
    { symbol: 'xauusd', filter: '' },
  ],
  Coin: [
    { symbol: 'icpusdt', filter: '' },
    { symbol: 'bnbusdt', filter: '' },
    { symbol: 'linkusdt', filter: 'crypto' },
    { symbol: 'tlmusdt', filter: 'crypto' },
    { symbol: 'cocosusdt', filter: 'crypto' },
    { symbol: 'oneusdt', filter: 'crypto' },
    { symbol: 'wrxusdt', filter: 'crypto' },
  ],
  // Forex: [
  //   { symbol: 'eurusd', filter: '', exchange: 'OANDA' },
  //   { symbol: 'eurjpy', filter: '', exchange: 'OANDA' },
  //   { symbol: 'gbpusd', filter: '', exchange: 'OANDA' },
  //   { symbol: 'gbpjpy', filter: '', exchange: 'OANDA' },
  //   { symbol: 'audusd', filter: '', exchange: 'OANDA' },
  //   { symbol: 'audjpy', filter: '', exchange: 'OANDA' },
  //   { symbol: 'nzdusd', filter: '', exchange: 'OANDA' },
  //   { symbol: 'nzdjpy', filter: '', exchange: 'OANDA' },
  //   { symbol: 'usdcad', filter: '', exchange: 'OANDA' },
  //   { symbol: 'usdjpy', filter: '', exchange: 'OANDA' },
  // ],
  Stock: [
    { symbol: 'vnindex' },
    { symbol: 'tcb', filter: 'stock' },
    { symbol: 'ssi', filter: 'stock' },
  ],
}
const tokenToCategory = {}

const tokensPancakeSwap = [
  { name: 'gst', contract: '0x7edc0ec89f987ecd85617b891c44fe462a325869' },
  { name: 'try', contract: '0x75d107de2217ffe2cd574a1b3297c70c8fafd159' },
]

/**
 * MARK
 * Trading View
 */
Object.keys(tokensList).forEach((k) => {
  const market = MarketService()
  market.on('logged', () => {
    const subToken = async (token) => {
      const searchRes = await market.search(
        token.symbol,
        token.filter,
        token.exchange ?? ''
      )
      if (Array.isArray(searchRes) && searchRes.length !== 0) {
        const result = searchRes[0]
        console.log('Found:', result)
        market.subscribe(result.id)
      }
    }

    tokensList[k].forEach((token) => {
      console.log(k, token)
      subToken(token)
      tokenToCategory[token.symbol.toLowerCase()] = k
    })
  })

  market.on('price', (data) => {
    const symbol = String(data.symbol).split(':')[1]
    const category = tokenToCategory[symbol.toLowerCase()]
    if (!prices[category]) prices[category] = {}
    prices[category][symbol] = String(data.price).substring(0, 10)
  })
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
        const key = String(data['symbol'])
        if (!prices['Pancake']) prices['Pancake'] = {}
        prices['Pancake'][key] = String(data['price']).substring(0, 10)
      }
    } catch (err) {
      console.log('Error Axios - Maybe no internet connection')
    }
  })
}

setInterval(getPriceTokens, 4000)

