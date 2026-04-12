/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { ServiceWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{
    revision: string | null;
    url: string;
  }>;
};

const webllmHandler = new ServiceWorkerMLCEngineHandler();

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("message", (event) => {
  webllmHandler.onmessage(event);
});

export {};
