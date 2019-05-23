import axios, { setAuthToken, removeAuthToken } from '~/plugins/axios'
import cookies from 'js-cookie'

export const state = () => ({
  user: null
})

export const mutations = {
  SET_USER(state, user) {
    state.user = user
  }
}

export const actions = {
  async fetch({ commit }) {
    try {
      const response = await axios.get('/fetch')
      commit('SET_USER', response.data.result)
      return response
    } catch (error) {
      commit('SET_USER', null)
      return error
    }
  },

  login({ commit }, credentials) {
    return _login(commit, '/login', credentials)
  },

  loginGoogle({ commit }, token) {
    return _login(commit, '/google', { token })
  },

  logout({ commit }) {
    commit('SET_USER', null)
    removeAuthToken()
    cookies.remove('x-access-token')
    this.$router.push('/')
    return Promise.resolve()
  }
}

async function _login(commit, url, data) {
  try {
    const response = await axios.post(url, data)
    commit('SET_USER', response.data.user)
    setAuthToken(response.data.token)
    cookies.set('x-access-token', response.data.token, { expires: 30 })
    return response
  } catch (error) {
    return error
  }
}
