import jwt from 'jsonwebtoken'

export default function auth(req, res, next) {
  try {
    
    const header = req.headers['authorization'] || ''
    const [, token] = header.split(' ')
    
    if (!token) return res.status(401).json({ error: 'Token requerido' })

    const secret = process.env.JWT_SECRET || 'cacharreria_pos_jwt_secret_key_default_2026';

    const payload = jwt.verify(token, secret)
    
    // Asegurar que req.user tenga el campo id desde sub
    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role
    }
  
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}
