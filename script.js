
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

function hasArabicText(text) {
  return /[\u0600-\u06FF]/.test(text || '');
}

function updateActionButtonState() {
  var textarea = document.getElementById('textbox_id_1');
  var text = textarea ? textarea.value.trim() : '';
  var hasText = text.length > 0;
  var actionButtons = document.querySelectorAll('.text-action');
  var translateButton = document.getElementById('btn_07');
  var fontButton = document.getElementById('btn_09');

  actionButtons.forEach(function(button) {
    var enabled = hasText;
    if (button === translateButton) enabled = hasArabicText(text);
    button.classList.toggle('is-disabled', !enabled);
    button.setAttribute('aria-disabled', String(!enabled));
  });

  if (fontButton) {
    var fontEnabled = hasArabicText(text);
    fontButton.classList.toggle('is-disabled', !fontEnabled);
    fontButton.setAttribute('aria-disabled', String(!fontEnabled));
  }
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

function toggleAdBlockerHelp() {
  var help = document.getElementById('adBlockerHelp');
  var button = document.getElementById('adBlockerHelpButton');
  if (!help || !button) return;

  help.hidden = !help.hidden;
  button.setAttribute('aria-expanded', String(!help.hidden));
}


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
  updateActionButtonState();
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

  if (document.getElementById('btn_02').classList.contains('is-disabled')) return;

  var searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(textToSearch);
  window.open(searchUrl, '_blank', 'noopener,noreferrer');
}

function selectAndCopy() {
  var textarea = document.getElementById('textbox_id_1');
  if (!textarea || !textarea.value.trim()) return;
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
      updateActionButtonState();
  }).catch(function(err) {
      console.error('Failed to read clipboard contents: ', err);
  });
}


// pasteFromClipboard functions

const TRANSLATION_API_URL = 'https://muddy-glade-1ceb.elmokhtar-mchich.workers.dev/translate';

var yamliFonts = [
  'JetBrains Mono, JetBrains Mono Fallback, Amiri, monospace',
  'Tajawal, Amiri, sans-serif',
  'Lateef, Amiri, cursive',
  'Reem Kufi, Amiri, sans-serif',
  'Amiri, serif',
  'Cairo, Amiri, sans-serif',
  'El Messiri, Amiri, sans-serif',
  'Noto Naskh Arabic, Amiri, serif',
  'Noto Sans Arabic, Amiri, sans-serif'
];
var currentFontIndex = 0;
var yamliTextSizes = [16, 34, 20];
var currentTextSizeIndex = 0;

function getMainTextarea() {
  return document.getElementById('textbox_id_1');
}

function toggleFonts() {
  var textarea = getMainTextarea();
  if (!textarea) return;
  currentFontIndex = (currentFontIndex + 1) % yamliFonts.length;
  textarea.style.fontFamily = yamliFonts[currentFontIndex];
  updateVerticalTextAlignment(textarea);
}

function toggleTextSize() {
  var textarea = getMainTextarea();
  if (!textarea) return;
  currentTextSizeIndex = (currentTextSizeIndex + 1) % yamliTextSizes.length;
  textarea.style.fontSize = yamliTextSizes[currentTextSizeIndex] + 'px';
  updateVerticalTextAlignment(textarea);
}

function updateVerticalTextAlignment(textarea) {
  if (!textarea) return;

  var computed = getComputedStyle(textarea);
  var baseTop = Number(textarea.dataset.basePaddingTop);
  var baseBottom = Number(textarea.dataset.basePaddingBottom);

  if (!Number.isFinite(baseTop)) {
    baseTop = parseFloat(computed.paddingTop) || 0;
    textarea.dataset.basePaddingTop = String(baseTop);
  }
  if (!Number.isFinite(baseBottom)) {
    baseBottom = parseFloat(computed.paddingBottom) || 0;
    textarea.dataset.basePaddingBottom = String(baseBottom);
  }

  if (textarea.dataset.verticalCenter !== 'true') {
    textarea.style.paddingTop = baseTop + 'px';
    return;
  }

  var mirror = document.createElement('div');
  var horizontalPadding = (parseFloat(computed.paddingLeft) || 0) + (parseFloat(computed.paddingRight) || 0);
  mirror.style.position = 'fixed';
  mirror.style.left = '-10000px';
  mirror.style.top = '0';
  mirror.style.visibility = 'hidden';
  mirror.style.width = Math.max(0, textarea.clientWidth - horizontalPadding) + 'px';
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.overflowWrap = 'break-word';
  mirror.style.font = computed.font;
  mirror.style.lineHeight = computed.lineHeight;
  mirror.style.letterSpacing = computed.letterSpacing;
  mirror.style.wordSpacing = computed.wordSpacing;
  mirror.style.textIndent = computed.textIndent;
  mirror.style.textTransform = computed.textTransform;
  mirror.style.direction = computed.direction;
  mirror.textContent = textarea.value || ' ';
  document.body.appendChild(mirror);

  var contentHeight = mirror.getBoundingClientRect().height;
  mirror.remove();

  var availableHeight = textarea.clientHeight - baseTop - baseBottom;
  var verticalOffset = Math.max(0, (availableHeight - contentHeight) / 2);
  textarea.style.paddingTop = baseTop + verticalOffset + 'px';
}

function toggleAlignment() {
  var textarea = getMainTextarea();
  if (!textarea) return;

  var shouldCenter = textarea.dataset.verticalCenter !== 'true';
  textarea.dataset.verticalCenter = String(shouldCenter);
  textarea.style.textAlign = shouldCenter ? 'center' : 'right';
  updateVerticalTextAlignment(textarea);

  if (!textarea.dataset.verticalCenterEventsBound) {
    textarea.addEventListener('input', function() {
      updateVerticalTextAlignment(textarea);
    });
    window.addEventListener('resize', function() {
      updateVerticalTextAlignment(textarea);
    });

    if ('ResizeObserver' in window) {
      var observer = new ResizeObserver(function() {
        updateVerticalTextAlignment(textarea);
      });
      observer.observe(textarea);
      textarea._verticalCenterObserver = observer;
    }

    textarea.dataset.verticalCenterEventsBound = 'true';
  }
}

function toggleFontWeight() {
  var textarea = getMainTextarea();
  if (!textarea) return;
  textarea.style.fontWeight = getComputedStyle(textarea).fontWeight === 'normal' ? 'bold' : 'normal';
}

function updateTextColor() {
  var textarea = getMainTextarea();
  if (!textarea) return;
  textarea.style.color = textarea.style.color === 'black' ? 'white' : 'black';
}

function changeBackgroundColor() {
  var textarea = getMainTextarea();
  if (!textarea) return;
  var colors = ['burlywood', 'cadetblue', 'chocolate', 'coral', 'cornflowerblue', 'darkcyan', 'darkgrey', 'darkslategrey', 'darksalmon'];
  var currentIndex = colors.indexOf(textarea.style.backgroundColor);
  textarea.style.backgroundColor = colors[(currentIndex + 1) % colors.length];
}

function showLanguagePrompt() {
  var textarea = document.getElementById('textbox_id_1');
  if (!textarea || !hasArabicText(textarea.value)) return;
  document.getElementById('languagePrompt').style.display = 'block';
}

function hideLanguagePrompt() {
  document.getElementById('languagePrompt').style.display = 'none';
}

function isSamsungInternetOnAndroid() {
  return /Android/i.test(navigator.userAgent) && /SamsungBrowser/i.test(navigator.userAgent);
}

document.addEventListener('DOMContentLoaded', updateActionButtonState);

function showTranslationSection() {
  var shell = document.getElementById('translationSectionShell');
  var section = document.getElementById('translatedTextSection');
  var toggleButton = document.getElementById('toggleTranslationSectionButton');
  if (shell) shell.hidden = false;
  if (section) section.hidden = false;
  if (toggleButton) {
    toggleButton.setAttribute('aria-expanded', 'true');
    toggleButton.title = 'Hide translated text';
    var icon = toggleButton.querySelector('img');
    if (icon) icon.alt = 'Hide translated text';
  }
}

function toggleTranslationSection() {
  var section = document.getElementById('translatedTextSection');
  var toggleButton = document.getElementById('toggleTranslationSectionButton');
  if (!section || !toggleButton) return;

  section.hidden = !section.hidden;
  var isVisible = !section.hidden;
  toggleButton.setAttribute('aria-expanded', String(isVisible));
  toggleButton.title = isVisible ? 'Hide translated text' : 'Show translated text';
  var icon = toggleButton.querySelector('img');
  if (icon) icon.alt = isVisible ? 'Hide translated text' : 'Show translated text';
}

function updateTranslatedActionState(hasText) {
  ['translatedShareButton', 'translatedSearchButton', 'translatedCopyButton', 'translatedListenButton'].forEach(function(id) {
    var button = document.getElementById(id);
    if (!button) return;
    button.classList.toggle('is-disabled', !hasText);
    button.setAttribute('aria-disabled', String(!hasText));
  });
}

function showTranslatedText(translatedText, targetLang) {
  var output = document.getElementById('translatedTextOutput');
  var button = document.getElementById('openDeepLButton');
  var status = document.getElementById('translationStatus');
  var hasText = Boolean(translatedText && translatedText.trim());

  showTranslationSection();
  if (output) {
    output.value = translatedText;
    output.dataset.target = targetLang;
  }
  if (button) button.disabled = !hasText;
  updateTranslatedActionState(hasText);
  if (status) status.textContent = hasText ? '' : 'No translation was returned.';
}

function getTranslatedText() {
  var output = document.getElementById('translatedTextOutput');
  return output ? output.value.trim() : '';
}

function copyTranslatedText() {
  var text = getTranslatedText();
  if (!text) return;
  var output = document.getElementById('translatedTextOutput');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(showCopyNotification);
    return;
  }
  output.select();
  document.execCommand('copy');
  showCopyNotification();
}

function shareTranslatedText() {
  var text = getTranslatedText();
  if (!text) return;
  if (navigator.share) {
    navigator.share({ title: 'Yamli Mobile translation', text: text }).catch(function(error) {
      if (error.name !== 'AbortError') console.error('Unable to share translated text:', error);
    });
    return;
  }
  copyTranslatedText();
}

function searchTranslatedText() {
  var text = getTranslatedText();
  if (!text) return;
  window.open('https://www.google.com/search?q=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
}

function speakTranslatedText() {
  var text = getTranslatedText();
  if (!text || !('speechSynthesis' in window)) return;
  var output = document.getElementById('translatedTextOutput');
  var targetLang = output && output.dataset.target ? output.dataset.target : 'en';
  var utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = targetLang === 'zh-CN' ? 'zh-CN' : targetLang;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function openDeepLTranslator() {
  var output = document.getElementById('translatedTextOutput');
  var translatedText = output ? output.value.trim() : '';
  var targetLang = output && output.dataset.target ? output.dataset.target : 'auto';

  if (!translatedText) return;

  var encodedText = encodeURIComponent(translatedText);
  var webUrl = 'https://www.deepl.com/translator#auto/' + encodeURIComponent(targetLang) + '/' + encodedText;

  var openedWindow = window.open(webUrl, '_blank');
  if (openedWindow) {
    openedWindow.opener = null;
  } else {
    window.location.assign(webUrl);
  }
}

async function translateText(targetLang) {
  var textarea = document.getElementById('textbox_id_1');
  var textToTranslate = textarea ? textarea.value.trim() : '';

  if (!textToTranslate) {
    if (textarea) textarea.focus();
    hideLanguagePrompt();
    return;
  }

  hideLanguagePrompt();
  showTranslationSection();
  showTranslatedText('', targetLang);
  var status = document.getElementById('translationStatus');
  if (status) status.textContent = 'Translating...';

  try {
    var response = await fetch(TRANSLATION_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToTranslate, target: targetLang })
    });

    if (!response.ok) throw new Error('Translation API returned ' + response.status);

    var result = await response.json();
    if (!result.success || !result.translatedText) throw new Error('Translation API returned no result');

    showTranslatedText(result.translatedText, targetLang);
    return;
  } catch (error) {
    console.warn('Translation API unavailable; using browser fallback:', error);
  }

  // Fallback for local/offline use or before the Worker secret is configured.
  // Samsung Internet may hand this URL to the Translate app without its text,
  // so use the native share handoff there instead.
  if (isSamsungInternetOnAndroid() && navigator.share) {
    navigator.share({
      title: 'Translate to ' + targetLang,
      text: textToTranslate
    }).catch(function(error) {
      if (error.name !== 'AbortError') console.error('Unable to hand text to Translate:', error);
    });
    return;
  }

  var webUrl = 'https://www.deepl.com/translator#auto/' + encodeURIComponent(targetLang) + '/' + encodeURIComponent(textToTranslate);
  var openedWindow = window.open(webUrl, '_blank');

  // If a browser blocks the new tab, keep the action usable in the current tab.
  if (openedWindow) {
    openedWindow.opener = null;
  } else {
    window.location.assign(webUrl);
  }

}

// shareWithGoogleTranslate functions

