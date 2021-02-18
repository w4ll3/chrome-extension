chrome.runtime.onMessageExternal.addListener((request, sender, senderResponse) => {
  console.log(request, sender, senderResponse);
})