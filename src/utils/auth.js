const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const generatePassword = (payload) => {
  try {
    payload.salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(payload.password, payload.salt, 10000, 100, 'sha512').toString('hex')
    payload.password = hash
    return payload
  } catch (error) {
    console.info('error generated password', error)
    return payload
  }
}

const isValidPassword = (password, hash, salt) => {
  try {
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 100, 'sha512').toString('hex')
    return hash === hashPassword
  } catch (error) {
    console.info('error validated password', error)
    return false
  }
}

const setPayloadToken = (result, type = 'admin', column = false) => {
  const roles = type === 'admin' ? 'backoffice' : 'front'
  let sub = ''
  if (type === 'admin') {
    sub = result?.users_id.toString()
  }
  sub = result.users_id
  let full_name = ''
  if (column) {
    full_name = result.full_name
  }
  const jti = crypto.randomUUID();
  
  // Parse expires in from env (e.g., "24h" -> 86400 seconds)
  const parseExpiresIn = (expiresIn) => {
    if (!expiresIn) return 86400; // default 24h
    const timeUnit = expiresIn.slice(-1); // h, d, etc
    const timeValue = parseInt(expiresIn.slice(0, -1));
    if (timeUnit === 'h') return timeValue * 3600;
    if (timeUnit === 'd') return timeValue * 86400;
    return 86400; // default
  }
  
  const accessExpiresIn = parseExpiresIn(process.env.JWT_EXPIRES_IN || '24h');
  const refreshExpiresIn = parseExpiresIn(process.env.JWT_REFRESH_EXPIRES_IN || '7d');
  const algorithm = process.env.JWT_ALGORITHM || 'HS256';
  
  const payload = {
      sub,
      full_name,
      roles: [result?.role_name, roles],
      jti: jti,
      exp: Math.floor(Date.now() / 1000) + accessExpiresIn
  };
  const b_token = jwt.sign(payload, process.env.JWT_SECRET, { algorithm });
  
  return {
    bearer_token: b_token,
    access_token: {
      sub,
      full_name,
      roles: [result?.role_name, roles],
      jti: crypto.randomUUID(),
      exp: Math.floor(Date.now() / 1000) + accessExpiresIn
    },
    refresh_token: {
      sub,
      full_name,
      roles: [result?.role_name, roles],
      jti: crypto.randomUUID(),
      exp: Math.floor(Date.now() / 1000) + refreshExpiresIn
    },
    exp: accessExpiresIn
  }
}

const decodeToken = (type, req) => {
  try {
    const payload = {}
    const tokenHeader = req?.headers?.authorization ?? ''
    const token = tokenHeader.split(' ')[1]

    const decode = jwt.verify(token, process.env.JWT_SECRET)

    switch (type) {
      case 'created':
        payload.created_by = decode?.sub ?? 0
        break;
      case 'updated':
        payload.updated_by = decode?.sub ?? 0
        payload.updated_at = new Date().toISOString()
        break;
      case 'deleted':
        payload.deleted_by = decode?.sub ?? 0
        payload.deleted_at = new Date().toISOString()
        break;
      case 'default':
        payload.users_id = decode?.sub ?? 0
        break;
      case 'getRoles':
        return decode?.roles ?? []
      case 'refreshToken':
        payload.users_id = decode?.sub
        payload.is_admin = decode?.roles.toString() === 'front' ? 0 : 1
        payload.roles = decode?.roles ?? []
        break;
      default:
        return payload
    }
    if (process.env.NODE_ENV === 'development') {
      console.info(`decoded token is : ${JSON.stringify(payload)})`);
    }
    return payload
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`error decoded token : ${error})`);
    }
    return {
      users_id: '',
      created_by: '',
      is_admin: 1,
      roles: ['']
    }
  }
}

module.exports = {
  generatePassword,
  isValidPassword,
  setPayloadToken,
  decodeToken
}
