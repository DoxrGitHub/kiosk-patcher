function hideOverride(func, realFunc) {
    Object.defineProperty(func, "toString", {
        value: function() { return realFunc.toString(); },
        writable: false,
        configurable: false,
        enumerable: false
    });
}

const origlaunched = chrome.app.runtime.onLaunched.addListener;
const origreload = chrome.app.runtime.onRestarted.addListener;
const origmanifest = chrome.runtime.getManifest;
const origfetch = window.fetch;

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

window.fetch = function(...args) {
    if (args[0].includes("manifest.json")) {
        return Promise.resolve(new Response(JSON.stringify(manifestcontent), {
            headers: { "Content-Type": "application/json" }
        }));
    }
    return origfetch(...args);
};

hideOverride(window.fetch, origfetch);

chrome.runtime.getManifest = function() {
    return manifestcontent;
};

hideOverride(chrome.runtime.getManifest, origmanifest);
