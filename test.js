const axios = require('axios').default;

const tokens = {
  raca: '0x12bb890508c125661e03b09ec06e404bc9289040',
  wana: '0x339c72829ab7dd45c3c52f965e7abe358dd8761e',
  gunstar: '0x7edc0ec89f987ecd85617b891c44fe462a325869',
  try: '0x75d107de2217ffe2cd574a1b3297c70c8fafd159',
}

let params = {}
const getTokenPrices = () => {
  Object.values(tokens).forEach(async (addr) => {
    let res = await axios.get(`https://api.pancakeswap.info/api/v2/tokens/${addr}`)
    let data = res.data['data']
    if (data && data['symbol'] && data['price']) {
      params[data['symbol']] = data['price']
    }
  })
  console.log(params)
}

setInterval(getTokenPrices, 5000)