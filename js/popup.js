/*

Open Multiple Websites, a Google Chrome extension that lets you open
your frequently visted website(s) with a single click

And not just that, it also remember your last opened links
by storing your urls in chrome storage

*/

// open pages in new tabs
function loadUrls() {
  // If we are opening urls from History tab
  if (document.getElementById('text-panel').classList.contains('is-active')) {
    // fetch urls from textarea and split it
    var urls = document.getElementById('urls').value.split('\n');

    // run a loop on the fetched urls
    for(var i = 0; i < urls.length; i++){

      // remove the white space from the url
      cleanUrl = urls[i].replace(/\s/g, '');

      // if user input valid urls then open pages
      if(cleanUrl != '') {
         chrome.tabs.create({"url": cleanUrl, "selected": false});
      }

      // if user input no url
      else {
         document.getElementById('urls').innerHTML = "No value specified";
      }
    }
    // If we are opening URLS from history tab
  } else if (document.getElementById('history-panel').classList.contains('is-active')) {
    openSelectedHistory();
  }

}

// Save url in chrome storage
function saveUrls() {

  // Fetch urls from textarea and split it
  var urls = document.getElementById('urls').value.split('\n');

  var urlsContainer = "";

  // run a loop on the fetched urls
  for (var i = 0; i < urls.length; i++) {

    // if the user input valid urls, save it in local chrome storage
    if(urls[i] != ' ') {

       urlsContainer += urls[i] + '\n';
       localStorage['urls'] = urlsContainer;

    }
  }
 }

function openSelectedHistory() {
  var historyTableBody = document.getElementById('history-table-body');
  var selected = historyTableBody.getElementsByClassName('is-selected');

  var urls = document.getElementById('urls');
  var urlsHint = document.getElementById('urls-hint');

  if (selected.length > 0) {
    for (var i = 0; i < selected.length; i++) {
      var selectedItem = selected[i].getElementsByClassName('page-url');
      var selectedLink = selectedItem[0].textContent;
      chrome.tabs.create({"url": selectedLink, "selected": false});
    }
  }
}

function addLinks() {
  var historyTableBody = document.getElementById('history-table-body');
  var selected = historyTableBody.getElementsByClassName('is-selected');

  var urls = document.getElementById('urls');
  var urlsHint = document.getElementById('urls-hint');

  if (selected.length > 0) {
    for (var i = 0; i < selected.length; i++) {
      var selectedItem = selected[i].getElementsByClassName('page-url');
      urls.value += selectedItem[0].textContent += "\n"
      urlsHint.style.setProperty("visibility", "hidden");
      saveUrls();
      document.getElementById('text-tab').click();
    }
  }
}

// Clear history table
function removeTable(tableParent) {
  document.getElementById(tableParent).innerHTML = "";
}

// Add rows to the history table
function addTable(tableParent, data) {
  parentElem = document.getElementById(tableParent);
  var table = document.createElement('table');
  table.className = 'mdl-data-table mdl-js-data-table mdl-data-table--selectable';
  table.id = 'history-table';

  var headerTitle = document.createElement('th')
  var headerUrl = document.createElement('th')

  headerTitle.className = 'mdl-data-table__cell--non-numeric';
  headerTitle.textContent = "Title";

  headerUrl.className = 'mdl-data-table__cell--non-numeric';
  headerUrl.textContent = "URL";

  var tableHead = document.createElement('thead');
  var tableHeaderRow = document.createElement('tr');
  var tableBody = document.createElement('tbody');
  tableBody.id = "history-table-body";

  tableHeaderRow.appendChild(headerTitle);
  tableHeaderRow.appendChild(headerUrl);

  tableHead.appendChild(tableHeaderRow);
  table.appendChild(tableHead);

  // Iterate over all history results
  for (var i = 0, ie = data.length; i < ie; ++i) {
    // Create row element
    var tr = document.createElement('tr');
    // Create table data elements
    var tdTitle = document.createElement('td');
    var tdUrl = document.createElement('td');

    tdTitle.className = 'mdl-data-table__cell--non-numeric page-title';
    tdTitle.textContent = data[i].title;

    tdUrl.className = 'mdl-data-table__cell--non-numeric page-url';
    tdUrl.textContent = data[i].url;

    tr.appendChild(tdTitle);
    tr.appendChild(tdUrl);
    tableBody.appendChild(tr);
  }

  table.appendChild(tableBody);
  parentElem.appendChild(table);
  componentHandler.upgradeAllRegistered();
}

document.addEventListener('DOMContentLoaded', function () {

  // add an event listener to load url when button is clicked
  document.getElementById('button-open-links').addEventListener('click', loadUrls);

  // add an event listener to save url when button is clicked
  document.getElementById('button-open-links').addEventListener('click', saveUrls);

  // add an event listener to add links from history to page tab
  document.getElementById('button-add-links').addEventListener('click', addLinks);

  // reload the urls in the browser
  var urls = localStorage['urls'];
  if (!urls) {
    return;
  }

  document.getElementById('urls').value = urls;
});

window.onload = function() {
  document.getElementById('text-tab').addEventListener('click', function() {
    document.getElementById('button-add-links').classList.add('display-none');
  });

  document.getElementById('history-tab').addEventListener('click', function() {
    chrome.runtime.sendMessage({ type: "HISTORY_REQUEST" }, function(response) {
        removeTable('history-panel');
        addTable('history-panel', response.results);
    });
    document.getElementById('button-add-links').classList.remove('display-none');
  });
}
