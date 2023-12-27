import { verifyAccessToken } from '../utils/jwt.js'

export default async function auth(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({'error': 'Unauthorized'})
  }

  const token = req.headers.authorization.split(' ')[1]
  if (!token) {
    return res.status(401).send({ 'error': 'Unauthorized' })
  }

  await verifyAccessToken(token).then(user => {
    req.user = user // store the user in the `req` object. our next route now has access to the user via `req.user`
    next()
  }).catch(e => {
    return res.status(401).send({ 'error': e.message })
  })
}