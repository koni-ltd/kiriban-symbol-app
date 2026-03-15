/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SYMBOL_NODE_URL?: string;
  readonly VITE_SYMBOL_ADMIN_ADDRESS?: string;
  readonly VITE_SYMBOL_CURRENCY_MOSAIC_ID?: string;
  readonly VITE_SYMBOL_CURRENCY_DIVISIBILITY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
