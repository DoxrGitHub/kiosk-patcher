const origlaunched = chrome.app.runtime.onLaunched.addListener;
const origreload = chrome.app.runtime.onRestarted.addListener;

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
