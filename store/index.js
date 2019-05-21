import cookie from 'cookie'
import { setAuthToken, removeAuthToken } from '~/plugins/axios'

export const actions = {

  nuxtServerInit ({dispatch}, context) {
    return new Promise(async (resolve, reject) => {
      const cookies = cookie.parse(context.req.headers.cookie || '')

      if (cookies.hasOwnProperty('x-access-token')) {
        setAuthToken(cookies['x-access-token'])

        try {
          const result = await dispatch('auth/fetch')
          resolve(true)
        } catch (error) {
          console.log('Token invalid.', error)
          removeAuthToken()
          resolve(false)
        }
      } else {
        removeAuthToken()
        resolve(false)
      }
    })
  }

}

