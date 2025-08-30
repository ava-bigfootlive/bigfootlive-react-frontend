/// <reference types="vite/client" />

declare const __BUILD_ID__: string;

interface ImportMetaEnv {
  readonly VITE_COGNITO_USER_POOL_ID: string
  readonly VITE_COGNITO_CLIENT_ID: string
  readonly VITE_COGNITO_REGION: string
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_CDN_URL?: string
  readonly VITE_STREAMING_URL?: string
  readonly VITE_APP_ENV?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}