import axios, { setAuthToken, removeAuthToken } from '~/plugins/axios'
import cookies from 'js-cookie'

export const state = () => ({
  user: null,
  redirectUrl: null
})

export const mutations = {
  SET_USER(state, user) {
    state.user = user
  },

  SET_REDIRECT_URL(state, redirectUrl) {
    state.redirectUrl = redirectUrl
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
    return auth(commit, '/login', credentials)
  },

  loginGoogle({ commit }, data) {
    return auth(commit, '/google', data)
  },

  signup({ commit }, credentials) {
    return auth(commit, '/signup', credentials)
  },

  logout({ commit }) {
    commit('SET_USER', null)
    removeAuthToken()
    cookies.remove('x-access-token')
    this.$router.push('/')
    return Promise.resolve()
  },

  setRedirectUrl({ commit }, url) {
    commit('SET_REDIRECT_URL', url)
  }
}

async function auth(commit, url, { remember, ...data}) {
  try {
    const response = await axios.post(url, data)
    commit('SET_USER', response.data.user)

    const token = response.data.token
    setAuthToken(token)
    cookies.set('x-access-token', token, { expires: remember ? 180 : '' })

    return response
  } catch (error) {
    return error
  }
}
