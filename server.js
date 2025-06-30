const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
  .once('error', (err) => {
    console.error(err)
    process.exit(1)
  })
  .listen(port, () => {
    console.log(`🚀 서버가 http://${hostname}:${port} 에서 시작되었습니다`)
    
    // 토큰 자동 갱신 스케줄러 시작
    if (!dev) {
      try {
        const tokenScheduler = require('./lib/tokenScheduler').default
        tokenScheduler.start()
      } catch (error) {
        console.error('❌ 토큰 스케줄러 시작 실패:', error)
      }
    }
  })
}) 