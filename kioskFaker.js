const origlaunched = chrome.app.runtime.onLaunched.addListener;
const origreload = chrome.app.runtime.onRestarted.addListener;
const origmanifest = chrome.runtime.getManifest;

// Create a shallow copy to avoid modifying the original manifest
let manifestcontent = JSON.parse(JSON.stringify(origmanifest()));

if (manifestcontent.background && Array.isArray(manifestcontent.background.scripts)) {
    manifestcontent.background.scripts = manifestcontent.background.scripts.filter(script => script !== "kioskFaker.js");
}

chrome.app.runtime.onLaunched.addListener = function(listener) {
    origlaunched.call(chrome.app.runtime.onLaunched, function(launchData) {
        launchData = { isKioskSession: true };
        listener(launchData);
    });
};

chrome.app.runtime.onRestarted.addListener = function(listener) {
    origreload.call(chrome.app.runtime.onRestarted, function(launchData) {
        launchData = { isKioskSession: true };
        listener(launchData);
    });
};

window.fetch = new Proxy(window.fetch, {
  apply(target, thisArg, args) {
    if (args[0].includes("manifest.json")) {
      let fakeManifest = manifestcontent;
      return Promise.resolve(new Response(JSON.stringify(fakeManifest), {
        headers: { "Content-Type": "application/json" }
      }));
    }
    return Reflect.apply(target, thisArg, args);
  }
});

chrome.runtime.getManifest = new Proxy(chrome.runtime.getManifest, {
  apply(target, thisArg, args) {
    console.log("🕵️‍♂️ Spoofing chrome.runtime.getManifest()");
    return manifestcontent;
  }
});

// ✅ kioskFaker.js successfully loaded and running!
