'use strict';

// requires chrome.identity, chrome.runtime

window.googleApi = (function() {
  self = {
    STATE_NO_AUTH: 1,
    STATE_ACQUIRING_AUTHTOKEN: 2,
    STATE_AUTHTOKEN_ACQUIRED: 3
  }

  self.state = self.STATE_NO_AUTH;

  function changeState(newState) {
    self.state = newState;

    if (self.onStateChange) {
      self.onStateChange(self.state)
    }
  }

  function getUserInfo() {
    xhrWithAuth('GET',
      'https://www.googleapis.com/plus/v1/people/me',
      (response) => console.log(response)
    )
  }

  function getFileList(query, callback) {
    // TODO: when for two separate words, make fullText ... or fullText
    // extract in:... statements for in-folder searching
    // when quoted words, group them into one fullText ... statement
    // when in:... is in quotes, just search for it
    // ....nested quotes....?
    query = `fullText contains '${query}' and trashed = false`

    console.log('query', query)
    let search = `?pageSize=3&spaces=drive&q=${encodeURIComponent(query)}`
    console.log('search', search)

    xhrWithAuth('GET',
      'https://www.googleapis.com/drive/v3/files' + search,
      (response) => {
        console.log(response)
        callback(JSON.parse(response))
      }
    )
  }

  /**
    Chrome caches tokens and takes care of renewing when it is expired.
    In that sense, getAuthToken only goes to the server if there is
    no cached token or if it is expired. If you want to force a new
    token (for example when user changes the password on the service)
    you need to call removeCachedAuthToken()
  **/
  function interactiveSignIn() {
    changeState(self.STATE_ACQUIRING_AUTHTOKEN);

    // This is the normal flow for authentication/authorization
    // on Google properties. You need to add the oauth2 client_id and scopes
    // to the app manifest. The interactive param indicates if a new window
    // will be opened when the user is not yet authenticated or not.
    // @see http://developer.chrome.com/apps/app_identity.html
    // @see http://developer.chrome.com/apps/identity.html#method-getAuthToken
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError);
        changeState(self.STATE_NO_AUTH);
      } else {
        console.log('Token acquired:'+token+
          '. See chrome://identity-internals for details.');
        changeState(self.STATE_AUTHTOKEN_ACQUIRED);
      }
    });
  }

  function revokeToken() {
    user_info_div.innerHTML="";
    chrome.identity.getAuthToken({ 'interactive': false },
      function(current_token) {
        if (!chrome.runtime.lastError) {

          chrome.identity.removeCachedAuthToken(
            { token: current_token },
            function() {}
          )

          var xhr = new XMLHttpRequest();
          xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' +
                   current_token);
          xhr.send();

          changeState(self.STATE_NO_AUTH);
          console.log('Token revoked and removed from cache. '+
            'Check chrome://identity-internals to confirm.');
        }
    });
  }

  // private
  function xhrWithAuth(method, url, onSuccess) {
    var access_token;
    var retry = true;

    getToken();

    function getToken() {
      chrome.identity.getAuthToken({ interactive: false }, function(token) {
        if (chrome.runtime.lastError) {
          updateFromResponse(chrome.runtime.lastError);
          return;
        }

        access_token = token;
        requestStart();
      });
    }

    function requestStart() {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
      xhr.onload = requestComplete;
      xhr.send();
    }

    function requestComplete() {
      if (this.status == 401 && retry) {
        retry = false;
        chrome.identity.removeCachedAuthToken({ token: access_token },
                                              getToken);
      } else {
        updateFromResponse(null, this.status, this.response, onSuccess);
      }
    }

    function updateFromResponse(error, status, response, onSuccess) {
      if (!error && status == 200) {
        changeState(self.STATE_AUTHTOKEN_ACQUIRED);
        onSuccess(response)
      } else {
        changeState(self.STATE_NO_AUTH);
      }
    }
  }


  return Object.assign(self, {
    interactiveSignIn: interactiveSignIn,
    getUserInfo: getUserInfo,
    revokeToken: revokeToken,
    getFileList: getFileList
  })
})();
