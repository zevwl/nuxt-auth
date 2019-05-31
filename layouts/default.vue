<template>
  <v-app>
    <v-toolbar
      fixed
      app
    >
      <v-toolbar-title v-text="title" />

      <v-spacer />

      <template v-if="!user">
        <v-btn color="primary" flat nuxt to="/signup">Signup</v-btn>
        <v-btn color="primary" flat nuxt to="/login">Login</v-btn>
      </template>

      <template v-else>
        <v-btn color="primary" flat nuxt to="/me">Profile</v-btn>
        <v-btn color="primary" flat nuxt to="/admin">Admin</v-btn>
      </template>
    </v-toolbar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      title: 'Nuxt Auth'
    }
  },

  computed: mapState('auth', ['user'])
}
</script>
