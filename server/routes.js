module.exports = ({express, db, bcrypt, jwt, envToken}) => {
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
              envToken, {
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

    jwt.verify(accessToken, envToken, (error, result) => {
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

  return router
}
