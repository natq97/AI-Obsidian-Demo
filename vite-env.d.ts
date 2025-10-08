// Fix: Replace non-working vite/client reference with explicit definitions
// This resolves errors in App.tsx and the file itself.
interface ImportMetaEnv {
    readonly VITE_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
