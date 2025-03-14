/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly PAYLOAD_PUBLIC_BASE_URL: string;
    readonly MEDUSA_BACKEND_URL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }