// requires googleApi

function resetDefaultSuggestion() {
  chrome.omnibox.setDefaultSuggestion({
    description: "'gd': Search the google drive for %s'"
  });
}

resetDefaultSuggestion();

chrome.omnibox.DescriptionStyleType = 'url'
chrome.omnibox.OnInputEnteredDisposition = 'currentTab'

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
  googleApi.getFileList(text, (resp) => {
    suggest(resp.files.map((file) => (
      {
        content: fileEditUrl(file),
        description: `<dim>${file.name}</dim>`
      }
    )))
  })
});

chrome.omnibox.onInputCancelled.addListener(function() {
  resetDefaultSuggestion();
});

function navigate(url) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.update(tabs[0].id, {url: url});
  });
}

function fileEditUrl(file) {
  return `https://docs.google.com/document/d/${file.id}/edit`
}

chrome.omnibox.onInputEntered.addListener(function(text, disposition) {
  console.log(text, disposition)
  if (disposition === 'currentTab') {
    if (text.match(/^https:/)) {
      // a suggestion has been highlighted, go there
      navigate(text)
    } else {
      // search with query, get the first file, and go there...
      // future alternative, somehow go to list of files matching all file ids in results?
      googleApi.getFileList(text, (resp) => navigate(fileEditUrl(resp.files[0])))
    }
  } else {
    console.log('unsupported disposition')
  }
});
