export default function ({ store, error, redirect, route }) {
  const authUser = store.state.auth.user
  if (!authUser) {
    error({
      message: 'You are not authenticated',
      statusCode: 403
    })
    return redirect('/login')
  } else if (!authUser.admin) {
    error({
      message: 'You are not authorized',
      statusCode: 403
    })
  }
}
