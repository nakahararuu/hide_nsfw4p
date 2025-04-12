import { BrowserContextStorage } from "./browser-context-storage.d.js";

const isLocal = (process.env.RUN_LOCALLY === 'true');
const storageModule = await import(isLocal ? './local-storage.js' : './s3-storage.js');
export const { storeState, restoreState, hasState, snapshot } = storageModule as BrowserContextStorage;
