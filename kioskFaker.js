function hideOverride(func, realFunc) {
    const proxy = new Proxy(func, {
        apply(target, thisArg, args) {
            return Reflect.apply(realFunc, thisArg, args);
        }
    });

    Object.defineProperty(proxy, "toString", {
        value: function() {
            return `function ${realFunc.name || 'anonymous'}() { [native code] }`;
        },
        writable: false,
        configurable: false,
        enumerable: false
    });

    return proxy;
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

window.fetch = hideOverride(window.fetch, origfetch);
chrome.runtime.getManifest = hideOverride(chrome.runtime.getManifest, origmanifest);
