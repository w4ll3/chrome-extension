importScripts('flutter_service_worker.js');

chrome.runtime.onMessageExternal.addListener((request, sender, senderResponse) => {
  console.log(request, sender, senderResponse);
})