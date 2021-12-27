const WebSocketServer = require('ws').Server
const marketAPI = require('./main');
const axios = require('axios').default;

const wss = new WebSocketServer({port: 5001})
var connections = []

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });
  ws.on('close', (ws) => {
    const index = connections.indexOf(ws)
    if (index > -1) { connections.splice(index, 1) }
  })
  connections.push(ws)
})

const market = marketAPI();
market.on('logged', async () => {
  console.log('API LOGGED');

  const searchBTC = (await market.search('btcusdt', 'crypto'))[0];
  console.log('Found BTCUSDT:', searchBTC);
  market.subscribe(searchBTC.id);

  const searchXAU = (await market.search('xauusd'))[0];
  console.log('Found XAUUSD: ', searchXAU);
  market.subscribe(searchXAU.id);
});

market.on('price', (data) => {
  console.log(data.symbol, '=>', data.price);
  connections.forEach((con) => {
    con.send(JSON.stringify({Symbol: data.symbol, Price: data.price}))
  })
});

const tokens = {
  raca: '0x12bb890508c125661e03b09ec06e404bc9289040',
  wana: '0x339c72829ab7dd45c3c52f965e7abe358dd8761e',
  gunstar: '0x7edc0ec89f987ecd85617b891c44fe462a325869',
  try: '0x75d107de2217ffe2cd574a1b3297c70c8fafd159',
  // ceek: '0xe0f94ac5462997d2bc57287ac3a3ae4c31345d66'
}

let priceTokens = {}
const getPriceTokens = () => {
  Object.values(tokens).forEach(async (addr) => {
    let res = await axios.get(`https://api.pancakeswap.info/api/v2/tokens/${addr}`)
    let data = res.data['data']
    if (data && data['symbol'] && data['price']) {
      priceTokens[data['symbol']] = data['price']
    }
  })
  console.log({BSCTokens: priceTokens})
  connections.forEach((con) => {
    con.send(JSON.stringify({BSCTokens: priceTokens}))
  })
}

setInterval(getPriceTokens, 5000)