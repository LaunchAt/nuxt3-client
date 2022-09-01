export default defineNuxtRouteMiddleware(async () => {
  const { $auth } = useNuxtApp()
  if (!$auth.isLoggedIn) {
    await $auth.fetchUser()
  }
})
