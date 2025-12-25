const whitelist = [
  'http://localhost',
  'https://88c98d580c697d.lhr.life',
  'https://motorsights.com',
  'http://motorsights.com'
]

let allow
if (process.env.NODE_ENV === 'development') {
  allow = '*'
} else {
  allow = function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true)
    }
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

const corsOptions = {
  origin: allow,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

module.exports = { corsOptions }
