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
          <v-btn color="primary" flat @click="$store.dispatch('auth/fetch')">Check Me</v-btn>
          <v-btn color="primary" flat nuxt  to="/">Main Page</v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  computed: {
    user() {
      return (this.$store.state.auth || {}).user || null
    }
  }
}
</script>

