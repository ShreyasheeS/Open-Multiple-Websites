// search history to find up to ten links that a user has typed in and show them
function buildHistoryList(returnUrlList) {
  // To look for history items visited in the last week,
  // subtract a week of microseconds from the current time.
  var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  var oneWeekAgo = (new Date).getTime() - microsecondsPerWeek;
  // Track the number of callbacks from chrome.history.getVisits()
  // that we expect to get.  When it reaches zero, we have all results.
  var numRequestsOutstanding = 0;
  var pageTitles = {};
  chrome.history.search({
      'text': '',              // Return every history item....
      'startTime': oneWeekAgo  // that was accessed less than one week ago.
    },
    function(historyItems) {
      // For each history item, get details on all visits.
      for (var i = 0; i < historyItems.length; ++i) {
        var url = historyItems[i].url;
        var title = historyItems[i].title;
        pageTitles[url] = title;

        var processVisitsWithUrl = function(url) {
          // We need the url of the visited item to process the visit.
          // Use a closure to bind the url into the callback's args.
          return function(visitItems) {
            processVisits(url, visitItems);
          };
        };
        chrome.history.getVisits({url: url}, processVisitsWithUrl(url));
        numRequestsOutstanding++;
      }
      if (!numRequestsOutstanding) {
        onAllVisitsProcessed();
      }
    });
  // Maps URLs to a count of the number of times the user typed that URL into
  // the omnibox.
  var urlToCount = {};
  // Callback for chrome.history.getVisits().  Counts the number of
  // times a user visited a URL by typing the address.
  var processVisits = function(url, visitItems) {
    for (var i = 0, ie = visitItems.length; i < ie; ++i) {
      // Uncomment to ignore items unless the user typed the URL.
      // if (visitItems[i].transition != 'typed') {
      //   continue;
      // }
      if (!urlToCount[url]) {
        urlToCount[url] = 0;
      }
      urlToCount[url]++;
    }
    // If this is the final outstanding call to processVisits(),
    // then we have the final results.  Use them to build the list
    // of URLs to show in the popup.
    if (!--numRequestsOutstanding) {
      onAllVisitsProcessed();
    }
  };
  // This function is called when we have the final list of URls to display.
  var onAllVisitsProcessed = function() {
    // Get the top scorring urls.
    urlArray = [];
    for (var url in urlToCount) {
      urlArray.push(url);
    }
    // Sort the URLs by the number of times the user typed them.
    urlArray.sort(function(a, b) {
      return urlToCount[b] - urlToCount[a];
    });
    var topUrls = urlArray.slice(0, 7);

    var results = [];

    for (var i = 0; i < topUrls.length; i++) {
      results.push({
        url: topUrls[i],
        title: pageTitles[topUrls[i]]
      })
    }
    console.log("RESULTS: ", results);
    returnUrlList({
      results: results
    });
  };
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type === "HISTORY_REQUEST") {
      buildHistoryList(sendResponse);
    }
    return true;
  }
);
