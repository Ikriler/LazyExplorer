document.addEventListener('visibilitychange', function(){
    if (!document.hidden) {
        chrome.storage.local.get('events', function (result) {
            populateEvents(result);
        });
    }
});

chrome.storage.local.get('events', function (result) {
    populateEvents(result);
});