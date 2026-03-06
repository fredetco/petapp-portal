/// <reference types="vite/client" />

// Fallback declaration for import.meta.env in case Vite types aren't resolved
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_MAIN_APP_URL?: string;
  readonly VITE_POLYGON_RPC_URL?: string;
  readonly VITE_PET_REGISTRY_CONTRACT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
