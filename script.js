
function shareText() {
  var textarea = document.getElementById('textbox_id_1');
  var textToShare = textarea ? textarea.value.trim() : '';

  if (!textToShare) {
    if (textarea) textarea.focus();
    return;
  }

  var shareData = {
    title: 'Yamli Mobile',
    text: textToShare
  };

  if (navigator.share) {
    navigator.share(shareData).catch(function(error) {
      // Closing the native share sheet is not an error that needs reporting.
      if (error.name !== 'AbortError') console.error('Unable to share text:', error);
    });
    return;
  }

  // Desktop browsers without Web Share still get a useful fallback.
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(textToShare).then(showCopyNotification).catch(function(error) {
      console.error('Unable to copy text for sharing:', error);
    });
    return;
  }

  textarea.focus();
  textarea.select();
  document.execCommand('copy');
  showCopyNotification();
}

function showCopyNotification() {
  var notification = document.getElementById('copyNotification');
  if (!notification) return;
  notification.style.visibility = 'visible';
  setTimeout(function() {
    notification.style.visibility = 'hidden';
  }, 1000);
}


//notifications

function notifyMe() {
// Let's check if the browser supports notifications
if (!("Notification" in window)) {
  alert("This browser does not support desktop notification");
}

// Let's check whether notification permissions have already been granted
else if (Notification.permission === "granted") {
  // If it's okay let's create a notification
  var notification = new Notification("Hi there!");
}

// Otherwise, we need to ask the user for permission
else if (Notification.permission !== "denied") {
  Notification.requestPermission().then(function (permission) {
    // If the user accepts, let's create a notification
    if (permission === "granted") {
      var notification = new Notification("Hi there!");
    }
  });
}

// At last, if the user has denied notifications, and you
// want to be respectful there is no need to bother them any more.
}
//notifications


//cut functions

function fct_cut(){
	var overlayme = document.getElementById("dialog-container");
	overlayme.style.display = "block";
document.getElementById('id_confrmdiv').style.display="block"; //this is the replace of this line
document.getElementById('id_truebtn').onclick = function(){
     /* Get the text field */
  var DelText = document.getElementById("textbox_id_1");
  /* Select the text field */
  DelText.select();
  DelText.setSelectionRange(0, 99999); /*For mobile devices*/
  /* Copy the text inside the text field */
  document.execCommand("delete");
  /* Alert the copied text 
  alert("Copied the text: " + copyText.value);*/
    /* alert('true'); */ 
	document.getElementById('id_confrmdiv').style.display = "none";
	    overlayme.style.display = "none";
	return false;
};
document.getElementById('id_falsebtn').onclick = function(){
    /* alert('false'); */
document.getElementById('id_confrmdiv').style.display = "none"; 
    overlayme.style.display = "none";
   return false;
};
}
//cut functions

//select all and copy all functions

// Search the current text on Google.
function searchtext() {
  var textarea = document.getElementById('textbox_id_1');
  var textToSearch = textarea ? textarea.value.trim() : '';

  if (!textToSearch) {
    if (textarea) textarea.focus();
    return;
  }

  var searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(textToSearch);
  window.open(searchUrl, '_blank', 'noopener,noreferrer');
}

function selectAndCopy() {
  var textarea = document.getElementById('textbox_id_1');
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  document.execCommand('copy');

  var notification = document.getElementById('copyNotification');
  notification.style.visibility = 'visible';
  setTimeout(function() {
      notification.style.visibility = 'hidden';
  }, 1000);
}
//select all and copy all functions

// pasteFromClipboard functions

function pasteFromClipboard() {
  var textarea = document.getElementById('textbox_id_1');
  textarea.focus();

  navigator.clipboard.readText().then(function(text) {
      var start = textarea.selectionStart;
      var end = textarea.selectionEnd;
      var currentText = textarea.value;
      var newText = currentText.substring(0, start) + text + currentText.substring(end);
      textarea.value = newText;
      textarea.setSelectionRange(start + text.length, start + text.length);
  }).catch(function(err) {
      console.error('Failed to read clipboard contents: ', err);
  });
}


// pasteFromClipboard functions

// shareWithGoogleTranslate functions

function showLanguagePrompt() {
  document.getElementById('languagePrompt').style.display = 'block';
}

function hideLanguagePrompt() {
  document.getElementById('languagePrompt').style.display = 'none';
}

function translateText(targetLang) {
  var textarea = document.getElementById('textbox_id_1');
  var textToTranslate = textarea ? textarea.value.trim() : '';

  if (!textToTranslate) {
    if (textarea) textarea.focus();
    hideLanguagePrompt();
    return;
  }

  var webUrl = 'https://translate.google.com/?sl=auto&tl=' + encodeURIComponent(targetLang) + '&text=' + encodeURIComponent(textToTranslate);
  var openedWindow = window.open(webUrl, '_blank');

  // If a browser blocks the new tab, keep the action usable in the current tab.
  if (openedWindow) {
    openedWindow.opener = null;
  } else {
    window.location.assign(webUrl);
  }

  hideLanguagePrompt();
}

// shareWithGoogleTranslate functions

