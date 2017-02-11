// Saves options to chrome.storage
function save_options() {
  var color = document.getElementById('color').value;
  var likesColor = document.getElementById('like').checked;
  chrome.storage.sync.set({
    favoriteColor: color,
    likesColor: likesColor
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    favoriteColor: 'red',
    likesColor: true
  }, function(items) {
    document.getElementById('color').value = items.favoriteColor;
    document.getElementById('like').checked = items.likesColor;
  });
}

function disableButton(button) {
  button.setAttribute('disabled', 'disabled');
}

function enableButton(button) {
  button.removeAttribute('disabled');
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options
);

window.onload = function () {
  signin_button = document.querySelector('#signin');
  signin_button.addEventListener('click', googleApi.interactiveSignIn);

  xhr_button = document.querySelector('#getxhr');
  xhr_button.addEventListener('click', googleApi.getUserInfo.bind(googleApi, true));

  revoke_button = document.querySelector('#revoke');
  revoke_button.addEventListener('click', googleApi.revokeToken);

  user_info_div = document.querySelector('#user_info');

  googleApi.onStateChange = (state) => {
    switch (state) {
      case googleApi.STATE_NO_AUTH:
        enableButton(signin_button);
        disableButton(xhr_button);
        disableButton(revoke_button);
        break;
      case googleApi.STATE_ACQUIRING_AUTHTOKEN:
        console.log('Acquiring token...');
        disableButton(signin_button);
        disableButton(xhr_button);
        disableButton(revoke_button);
        break;
      case googleApi.STATE_AUTHTOKEN_ACQUIRED:
        disableButton(signin_button);
        enableButton(xhr_button);
        enableButton(revoke_button);
        break;
    }
  }

  // Trying to get user's info without signing in, it will work if the
  // application was previously authorized by the user.
  googleApi.getUserInfo(false);
}
