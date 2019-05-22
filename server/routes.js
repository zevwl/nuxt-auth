require('dotenv').config()

module.exports = ({express, db, bcrypt, jwt, google}) => {
  const router =  express.Router()

  router.get('/test', (req, res) => {
    db.query('SELECT 1 + 1', (error, result) => {
      if (error) {
        return res.status(500).json({
          type: 'error',
          error
        })
      }

      res.json({
        type: 'success',
        message: 'Test OK',
        result
      })
    })
  })

  router.post('/login', (req, res) => {
    const  { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({
        type: 'error',
        message: 'Email and password is required.'
      })
    }

    db.query('SELECT * FROM users WHERE email = ?', email, (error, rows) => {
      if (error) {
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

      const user = rows[0]
      bcrypt.compare(password, user.password, (error, result) => {
        if (error) {
          return res.status(500).json({
            type: 'error',
            message: 'Bcrypt error.',
            error
          })
        }

        if (result) {
          res.json({
            type: 'success',
            message: 'User logged in.',
            user: {
              id: user.id,
              email: user.email
            },
            token: jwt.sign({
                id: user.id,
                email: user.email
              },
              process.env.TOKEN, {
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
    })
  })

  router.get('/me', (req, res) => {
    const accessToken = req.headers['x-access-token']
    if (!accessToken) {
      return res.status(400).json({
        type: 'error',
        message: 'Header x-access-token not found.'
      })
    }

    jwt.verify(accessToken, process.env.TOKEN, (error, result) => {
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
    }, (error, response) => {
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

      db.query('SELECT * FROM users WHERE email = ?', emails[0].value, (error, rows) => {
        if (error) {
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

        const user = rows[0]
        res.json({
          type: 'success',
          message: 'User logged in with Google.',
          user: {
            id: user.id,
            email: user.email
          },
          token: jwt.sign({
            id: user.id,
            email: user.email
          }, process.env.TOKEN, { expiresIn: '30d' })
        })
      })
    })
  })

  return router
}
