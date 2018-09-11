let isFirefox = typeof InstallTrigger !== 'undefined';

function storageAction(request) {
    request.identify && window.sessionStorage.setItem('identify', request.identify);
    request.logout && window.sessionStorage.removeItem('identify');
}

if (isFirefox) {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        storageAction(request);
    });
} else {
    chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
        storageAction(request);
    });
}