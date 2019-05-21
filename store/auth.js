import axios from '~/plugins/axios'

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
      return response
    } catch (error) {
      return error
    }
  },

  logout({ commit }) {
    commit('SET_USER', null)
    return Promise.resolve()
  }
}
