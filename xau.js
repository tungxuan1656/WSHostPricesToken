const WebSocketServer = require('ws').Server
const MarketService = require('./main')

const wss = new WebSocketServer({ port: 5031 })
var connections = []

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

const xauToken = { symbol: 'xauusd', filter: '' }

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

  subToken(xauToken)
})

market.on('price', (data) => {
  const xauPrice = String(data.price).substring(0, 10)
  console.log(xauPrice)
  connections.forEach((con) => {
    con.send(xauPrice)
  })
})

