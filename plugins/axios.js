import axios from 'axios'
import cookies from 'js-cookie'

const tokenCookieName = 'x-access-token'
const token = cookies.get(tokenCookieName)

export default axios.create({
  baseURL: process.env.baseUrl
})

export function setAuthToken(token) {
  axios.defaults.headers.common[tokenCookieName] = token
}

export function removeAuthToken() {
  delete axios.defaults.headers.common[tokenCookieName]
}

if (token) {
  setAuthToken(token)
} else {
  removeAuthToken()
}
