export default function ({ store, error, redirect, route }) {
  if (!store.state.auth.user) {
    error({
      message: 'You are not authenticated',
      statusCode: 403
    })


    if (route.fullPath !== '/' || route.fullPath !== '/admin') {
      return redirect('/login', { next: route.fullPath })
    }
    return redirect('/login')
  }
}
