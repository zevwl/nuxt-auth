<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-card>
        <v-card-title class="headline">Admin Page</v-card-title>

        <v-card-text>
          <p v-if="user">Hello, {{ user.email }}</p>

          <p v-else>The user is not authenticated!</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat nuxt  to="/">Main Page</v-btn>

          <v-btn v-if="!user" color="primary" flat nuxt to="/login">Login</v-btn>
          <v-btn v-else color="primary" flat @click="logoutAndRedirect">Logout</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  middleware: 'auth',

  computed: mapState('auth', [
    'user'
  ]),

  methods: {
    ...mapActions({
      logout: 'auth/logout'
    }),

    async logoutAndRedirect() {
      await this.logout()
      this.$router.push('/')
    }
  }
}
</script>

