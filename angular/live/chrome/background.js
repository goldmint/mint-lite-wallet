chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
    request.identify && window.sessionStorage.setItem('identify', request.identify);
    request.logout && window.sessionStorage.removeItem('identify');
});