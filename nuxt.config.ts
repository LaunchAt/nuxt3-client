import { defineNuxtConfig } from 'nuxt'

const DEFAULT_LANGUAGE_CODE = process.env.DEFAULT_LANGUAGE_CODE
const DEFAULT_SITE_TITLE = process.env.DEFAULT_SITE_TITLE
const DEFAULT_SITE_DESCRIPTION = process.env.DEFAULT_SITE_DESCRIPTION
const DEFAULT_OG_IMAGE_URL = process.env.DEFAULT_OG_IMAGE_URL
const DEFAULT_SITE_URL = process.env.DEFAULT_SITE_URL

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: DEFAULT_LANGUAGE_CODE,
        prefix: 'og: http://ogp.me/ns#',
      },
      title: DEFAULT_SITE_TITLE,
      meta: [
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'description', content: DEFAULT_SITE_DESCRIPTION },
        { name: 'og:title', content: DEFAULT_SITE_TITLE },
        { name: 'og:description', content: DEFAULT_SITE_DESCRIPTION },
        { name: 'og:type', content: 'website' },
        { name: 'og:url', content: DEFAULT_SITE_URL },
        { name: 'og:image', content: DEFAULT_OG_IMAGE_URL },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: DEFAULT_SITE_TITLE },
        { name: 'twitter:description', content: DEFAULT_SITE_DESCRIPTION },
        { name: 'twitter:image', content: DEFAULT_OG_IMAGE_URL },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: DEFAULT_SITE_URL },
      ],
      script: [
        { src: '/js/polyfills.js' },
      ],
    },
  },
  components: [
    '~/components/',
    '~/components/common/',
    '~/components/models/',
    '~/components/pages/',
  ],
  css: [
    '~/assets/css/icons.css',
    '~/assets/css/tailwind.css',
  ],
  modules: [
    '@nuxtjs/tailwindcss',
  ],
  runtimeConfig: {
    public: {
      API_URL: '',
      AWS_S3_BUCKET_NAME: '',
      AWS_S3_REGION: '',
      AWS_COGNITO_USER_POOL_ID: '',
      AWS_COGNITO_APP_CLIENT_ID: '',
      AWS_COGNITO_IDENTITY_POOL_ID: '',
    },
  },
})
