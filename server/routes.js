require('dotenv').config()

module.exports = ({express, db, crypt, jwt, google}) => {
  const router =  express.Router()

  router.post('/signup', async (req, res) => {
    const  { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({
        type: 'error',
        message: 'Email and password is required.'
      })
    }

    const hashedPassword = crypt.hash(password, 8)

    let result
    try {
      result = await db.runQuery('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword])
    } catch (error) {
      return res.status(500).json({
        type: 'error',
        message: 'Database error',
        error
      })
    }

    const user = {
      email,
      id: result.insertId,
      admin: false
    }

    const token = jwt.sign(user, process.env.SECRET)

    res.json({
      type: 'success',
      message: 'New user created.',
      user,
      token
    })
  })

  router.post('/login', async (req, res) => {
    const  { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({
        type: 'error',
        message: 'Email and password is required.'
      })
    }

    let rows
    try {
      rows = await db.runQuery('SELECT * FROM users WHERE email = ?', [email])
    } catch (error) {
      return res.status(500).json({
        type: 'error',
        message: 'Database error',
        error
      })
    }

    if (!rows.length) {
      return res.status(403).json({
        type: 'error',
        message: 'Email not found.'
      })
    }

    let user = rows[0]
    const result = crypt.compare(password, user.password)

    if (result) {
      user = {
        id: user.id,
        email: user.email,
        admin: !!user.admin
      }

      res.json({
        type: 'success',
        message: 'User logged in.',
        user,
        token: jwt.sign(user,
          process.env.SECRET, {
            expiresIn: '30d'
          }
        ),
      })
    } else {
      res.status(403).json({
        type: 'error',
        message: 'Password is incorrect.'
      })
    }
  })

  router.get('/fetch', (req, res) => {
    const accessToken = req.headers['x-access-token']
    if (!accessToken) {
      return res.status(400).json({
        type: 'error',
        message: 'Header x-access-token not found.'
      })
    }

    jwt.verify(accessToken, process.env.SECRET, (error, result) => {
      if (error) {
        return res.status(403).json({
          type: 'error',
          message: 'Token invalid.',
          error
        })
      }

      res.json({
        type: 'success',
        message: 'Token valid.',
        result
      })
    })
  })

  router.post('/google', (req, res) => {
    if (!req.body.token) {
      return res.status(500).json({
        type: 'error',
        message: 'No access token provided.'
      })
    }

    const OAuth2 = google.auth.OAuth2
    const oauth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_SECRET)
    oauth2Client.setCredentials({ access_token: req.body.token })

    const plus = google.plus('v1')
    plus.people.get({
      userId: 'me',
      auth: oauth2Client
    }, async (error, response) => {
      if (error) {
        return res.status(500).json({ type: 'error', error })
      }

      const emails = (response.data || {}).emails
      if (!emails || !emails.length) {
        return res.status(500).json({
          type: 'error',
          message: 'No email in google.'
        })
      }

      let rows
      try {
        rows = await db.runQuery('SELECT * FROM users WHERE email = ?', [emails[0].value])
      } catch (error) {
        return res.status(500).json({
          type: 'error',
          message: 'Database error.',
          error
        })
      }

      if (!rows.length) {
        return res.status(401).json({
          type: 'error',
          message: 'Email not found.'
        })
      }

      let user = rows[0]
      user = {
        id: user.id,
        email: user.email,
        admin: !!user.admin
      }

      res.json({
        type: 'success',
        message: 'User logged in with Google.',
        user,
        token: jwt.sign(user, process.env.SECRET, { expiresIn: '30d' })
      })
    })
  })

  return router
}
