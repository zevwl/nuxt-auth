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
      const response = await axios.get('/me')
      commit('SET_USER', response.data.result)
      return response
    } catch (error) {
      commit('SET_USER', null)
      return error
    }
  },

  async login({ commit }, credentials) {
    try {
      const response = await axios.post('/login', credentials)
      commit('SET_USER', response.data.user)
      setAuthToken(response.data.token)
      cookies.set('x-access-token', response.data.token, { expires: 30 })
      return response
    } catch (error) {
      return error
    }
  },

  async loginGoogle({ commit }, token) {
    try {
      const response = await axios.post('/google', { token })
      commit('SET_USER', response.data.user)
      setAuthToken(response.data.token)
      cookies.set('x-access-token', response.data.token, { expires: 30 })
      return response
    } catch (error) {
      return error
    }
  },

  logout({ commit }) {
    commit('SET_USER', null)
    removeAuthToken()
    cookies.remove('x-access-token')
    return Promise.resolve()
  }
}
