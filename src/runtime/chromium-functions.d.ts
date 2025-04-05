import { Browser, BrowserContext, Page } from "playwright-core";

export type ChromiumFunctions = {
    openBrowser: () => Promise<Browser>;
    storeState: (state: BrowserContext) => Promise<void>;
    restoreState: (browser: Browser) => ReturnType<typeof browser.newContext>;
    hasState: () => Promise<boolean>;
    snapshot: (page: Page, label: String) => Promise<void>;
};
