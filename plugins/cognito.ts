import { Ref } from 'vue'
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js'
import {
  CognitoIdentityCredentialProvider,
  fromCognitoIdentity,
} from '@aws-sdk/credential-providers'
import Cookies from 'universal-cookie'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const { cookie } = useRequestHeaders(['cookie'])

  return {
    provide: {
      auth: new CognitoAuth({
        storage: new UniversalStorage(cookie),
        clientId: config.public.AWS_COGNITO_APP_CLIENT_ID,
        userPoolId: config.public.AWS_COGNITO_USER_POOL_ID,
        identityPoolId: config.public.AWS_COGNITO_IDENTITY_POOL_ID,
      }),
    },
  }
})

class CognitoAuth {
  idToken: Ref<string | null>
  credential: Ref<CognitoIdentityCredentialProvider | null>
  serverIdToken: string | null
  serverCredential: CognitoIdentityCredentialProvider | null
  #user: CognitoUser | null
  #userPool: CognitoUserPool
  #identityPoolId: string
  #identityPoolProviderKey: string

  constructor ({ clientId, userPoolId, identityPoolId, storage }) {
    const region = userPoolId.split('_').shift()
    this.#identityPoolProviderKey = `cognito-idp.${region}.amazonaws.com/${userPoolId}`
    this.idToken = ref(null)
    this.credential = ref(null)
    this.serverIdToken = null
    this.serverCredential = null
    this.#user = null
    this.#userPool = new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: clientId,
      Storage: storage,
    })
    this.#identityPoolId = identityPoolId
  }

  get isLoggedIn () {
    return !!this.idToken.value || !!this.serverIdToken
  }

  #refresh () {
    return new Promise((resolve, reject) => {
      if (this.#user) {
        this.#user.getSession((
          error: Error,
          session: CognitoUserSession | null
        ) => {
          if (error) {
            this.#onFailure(error)
            reject(error)
          } else if (session) {
            this.#onSuccess(session)
            resolve(session)
          }
        })
      } else {
        resolve(null)
      }
    })
  }

  #setUser (username: string) {
    this.#user = new CognitoUser({
      Username: username,
      Pool: this.#userPool,
    })
  }

  #clearUser () {
    this.#user = null
    this.idToken.value = null
    this.credential.value = null
    this.serverIdToken = null
    this.serverCredential = null
  }

  #onSuccess (session: CognitoUserSession) {
    this.#user.setSignInUserSession(session)
    const idToken = session.getIdToken().getJwtToken()
    const credential = fromCognitoIdentity({
      identityId: this.#identityPoolId,
      logins: {
        [this.#identityPoolProviderKey]: this.idToken.value || this.serverIdToken,
      },
    })
    this.idToken.value = idToken
    this.credential.value = credential
    this.serverIdToken = idToken
    this.serverCredential = credential
  }

  #onFailure (error: Error) {
    console.error(error)
    this.#clearUser()
  }

  async fetchUser () {
    this.#user = this.#userPool.getCurrentUser()
    await this.#refresh()
    return this
  }

  signIn (username: string, password: string) {
    return new Promise((resolve, reject) => {
      this.#setUser(username)
      this.#user.authenticateUser(
        new AuthenticationDetails({
          Username: username,
          Password: password,
        }),
        {
          onSuccess: (session) => {
            this.#onSuccess(session)
            resolve(session)
          },
          onFailure: (error) => {
            this.#onFailure(error)
            reject(error)
          },
        }
      )
    })
  }

  signUp (username: string, email: string, password: string) {
    return new Promise((resolve, reject) => {
      this.#userPool.signUp(
        username,
        password,
        [
          new CognitoUserAttribute({
            Name: 'email',
            Value: email
          }),
        ],
        [],
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      )
    })
  }

  signOut () {
    if (this.#user) {
      this.#user.signOut()
    }
    this.#clearUser()
  }

  confirmRegistration (username: string) {
    return new Promise((resolve, reject) => {
      this.#setUser(username)
      this.#user.confirmRegistration(
        '',
        true,
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      )
    })
  }

  resetPassword (username: string) {
    return new Promise((resolve, reject) => {
      this.#setUser(username)
      this.#user.forgotPassword({
        onSuccess: resolve,
        onFailure: reject,
      })
    })
  }

  confirmPassword (username: string, code: string, password: string) {
    return new Promise((resolve, reject) => {
      this.#setUser(username)
      this.#user.confirmPassword(
        code,
        password,
        {
          onSuccess: resolve,
          onFailure: reject,
        },
      )
    })
  }

  resendConfirmationCode (username: string) {
    return new Promise((resolve, reject) => {
      this.#setUser(username)
      this.#user.resendConfirmationCode((error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }
}

type Store = Record<string, string>

class UniversalStorage {
  store: Store
  cookies: Cookies

  constructor (cookie: any) {
    this.cookies = new Cookies(cookie || undefined)
    this.store = process.client ? window.localStorage : {}
    Object.assign(this.store, this.cookies.getAll())
  }

  getItem (key: keyof Store) {
    return this.store[key] || null
  }

  setItem (key: keyof Store, value: string) {
    this.store[key] = value

    if (process.client) {
      const tokenType = key.split('.').pop()
      const shouldSaveOnCookie = [
        'LastAuthUser',
        'accessToken',
        'refreshToken',
        'idToken'
      ].includes(tokenType)

      if (shouldSaveOnCookie) {
        this.cookies.set(key, value, {
          path: '/',
          sameSite: true,
          secure: window.location.hostname !== 'localhost',
        })
      }
    }
  }

  removeItem (key: string) {
    delete this.store[key]
    this.cookies.remove(key, { path: '/' })
  }

  clear () {
    for (const key of Object.keys(this.store)) {
      this.removeItem(key)
    }
  }
}
