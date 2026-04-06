// Yamli Android Space Key Handler - PRO VERSION v3.0
// Direct API Communication - NO DOM CLICKING
(function() {
  'use strict';
  
  var CONFIG = {
    debug: true,
    maxRetries: 3,
    retryDelay: 50
  };
  
  var isAndroid = /Android/i.test(navigator.userAgent);
  var textarea = document.getElementById('textbox_id_1');
  if (!isAndroid || !textarea) return;
  
  // Debug panel
  var debugDiv = document.createElement('div');
  debugDiv.id = 'yamliProDebug';
  debugDiv.style.cssText = 'position:fixed;bottom:10px;left:10px;background:rgba(0,0,0,0.9);color:#0f0;padding:10px;font-size:11px;z-index:99999;max-width:400px;max-height:250px;overflow:auto;font-family:monospace;border-radius:4px;border:2px solid #0f0;';
  debugDiv.innerHTML = '<b style="color:#ff0;">🔧 Yamli Pro v3.0</b><br>Direct API Mode<hr style="border-color:#0f0;margin:5px 0;">';
  document.body.appendChild(debugDiv);
  
  function debug(msg, type) {
    var color = type === 'error' ? '#f66' : type === 'warn' ? '#ff6' : '#0f0';
    var line = '<br><span style="color:' + color + '">' + msg + '</span>';
    debugDiv.innerHTML += line;
    debugDiv.scrollTop = debugDiv.scrollHeight;
    console.log('[YamliPro] ' + msg);
  }
  
  // Get the Yamli manager instance attached to textarea
  function getYamliManager() {
    return textarea.yamliManager;
  }
  
  // Check if menu is visible via API
  function isMenuVisible() {
    var manager = getYamliManager();
    return manager && manager.isMenuVisible && manager.isMenuVisible();
  }
  
  // Get current word selection from API
  function getCurrentWord() {
    var manager = getYamliManager();
    if (!manager || !manager.getSelection) return null;
    return manager.getSelection();
  }
  
  // Trigger API's internal space handling
  function triggerAPISpace() {
    var manager = getYamliManager();
    if (!manager) {
      debug('No yamliManager found', 'error');
      return false;
    }
    
    debug('Triggering API internal space handling...');
    
    try {
      // Method 1: Simulate the exact key sequence the API expects
      // Keydown (code 32) - this is what triggers selection in Yamli
      var kdEvt = document.createEvent('KeyboardEvent');
      kdEvt.initKeyboardEvent('keydown', true, true, window, 'Space', 0, false, false, false, false, 32);
      Object.defineProperty(kdEvt, 'keyCode', { value: 32 });
      Object.defineProperty(kdEvt, 'which', { value: 32 });
      textarea.dispatchEvent(kdEvt);
      
      // Keypress
      var kpEvt = document.createEvent('KeyboardEvent');
      kpEvt.initKeyboardEvent('keypress', true, true, window, ' ', 0, false, false, false, false, 32);
      Object.defineProperty(kpEvt, 'keyCode', { value: 32 });
      Object.defineProperty(kpEvt, 'which', { value: 32 });
      Object.defineProperty(kpEvt, 'charCode', { value: 32 });
      textarea.dispatchEvent(kpEvt);
      
      // Keyup
      var kuEvt = document.createEvent('KeyboardEvent');
      kuEvt.initKeyboardEvent('keyup', true, true, window, 'Space', 0, false, false, false, false, 32);
      Object.defineProperty(kuEvt, 'keyCode', { value: 32 });
      Object.defineProperty(kuEvt, 'which', { value: 32 });
      textarea.dispatchEvent(kuEvt);
      
      debug('API space sequence dispatched');
      return true;
      
    } catch (e) {
      debug('API trigger failed: ' + e.message, 'error');
      return false;
    }
  }
  
  // Process space using direct API communication
  var processing = false;
  
  function processSpaceAPI(e) {
    if (processing) return;
    processing = true;
    
    debug('=== SPACE DETECTED ===');
    
    // Check if API is ready
    var manager = getYamliManager();
    if (!manager) {
      debug('Yamli not initialized yet');
      processing = false;
      return;
    }
    
    debug('Yamli manager found');
    
    // Check if menu is visible
    if (!isMenuVisible()) {
      debug('Menu not visible, passing space through');
      processing = false;
      return;
    }
    
    debug('Menu is visible - triggering API selection');
    
    // Prevent default to stop space from being inserted
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Let Yamli API handle the space internally
    // The API will select the current suggestion and insert it
    var success = triggerAPISpace();
    
    if (success) {
      debug('API space triggered successfully');
      
      // The API should handle everything, but add space if needed
      setTimeout(function() {
        var val = textarea.value;
        if (!val.endsWith(' ') && !val.endsWith('\u00A0')) {
          textarea.value = val + ' ';
          textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
          debug('Added trailing space');
        }
        processing = false;
      }, 100);
    } else {
      processing = false;
    }
  }
  
  // Alternative: Use API's menu accept method if available
  function tryMenuAccept() {
    var manager = getYamliManager();
    if (manager && manager.hideTransliterations) {
      // This accepts the current suggestion
      manager.hideTransliterations();
      debug('Used hideTransliterations as accept');
      return true;
    }
    return false;
  }
  
  // Attach handlers
  function attachHandlers() {
    debug('Attaching handlers...');
    
    // Capture space before Yamli sees it
    textarea.addEventListener('keydown', function(e) {
      if (e.key === ' ' || e.keyCode === 32 || e.which === 32) {
        debug('keydown: SPACE captured');
        processSpaceAPI(e);
      }
    }, true); // Capture phase
    
    // Backup via input event
    textarea.addEventListener('input', function(e) {
      var val = textarea.value;
      var lastChar = val.slice(-1);
      
      if (lastChar === ' ' || lastChar === '\u00A0') {
        debug('input: SPACE detected (backup)');
        if (!val.endsWith('  ') && !val.endsWith('\u00A0\u00A0')) {
          processSpaceAPI(null);
        }
      }
    });
    
    debug('Handlers attached - Direct API Mode active');
  }
  
  // Initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachHandlers);
  } else {
    attachHandlers();
  }
  
  // Expose API
  window.YamliProHandler = {
    getManager: getYamliManager,
    isMenuVisible: isMenuVisible,
    getCurrentWord: getCurrentWord,
    triggerSpace: triggerAPISpace,
    test: function() {
      debug('Manual test - triggering API space');
      triggerAPISpace();
    }
  };
  
  debug('Pro Handler v3.0 initialized - Direct API Mode');
})();
