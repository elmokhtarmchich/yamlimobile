/**
 * Yamli Android Spacebar Handler
 * 4-Approach Strategy for Auto-Selecting Arabic Suggestions
 * 
 * Features:
 * - Approach 1: Direct API call (hideTransliterations)
 * - Approach 2: Click first Arabic suggestion in DOM
 * - Approach 3: Try available manager methods (acceptSuggestion, selectSuggestion, etc.)
 * - Approach 4: Simulate complete keyboard event sequence
 * - Auto-retry logic for attachment
 * - Auto-hide menu after selection
 * 
 * @version 1.0.0
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  var CONFIG = {
    debug: false,  // Set to true for debugging
    retryAttempts: 10,
    retryDelayMs: 100,
    textareaId: 'textbox_id_1',
    arabicIndex: 1,  // First Arabic suggestion is at index 1 (index 0 is English input)
    spaceDelayMs: 50,  // Delay before adding trailing space
    
    // Visual settings for debug panel
    debugPanelPosition: 'bottom-left', // 'bottom-left', 'bottom-right', 'top-left', 'top-right'
    debugPanelWidth: '400px',
    debugPanelMaxHeight: '300px'
  };

  // ============================================
  // STATE
  // ============================================
  var state = {
    initialized: false,
    attached: false,
    processing: false,
    attemptCount: 0,
    lastApproachUsed: null,
    successCount: 0
  };

  // ============================================
  // UTILITIES
  // ============================================
  
  function isAndroid() {
    return /Android/i.test(navigator.userAgent);
  }

  function log(msg, type) {
    var prefix = '[YamliProHandler] ';
    if (type === 'error') {
      console.error(prefix + msg);
    } else if (type === 'warn') {
      console.warn(prefix + msg);
    } else {
      console.log(prefix + msg);
    }
    // Only update debug panel if debug mode is enabled
    if (CONFIG.debug) {
      updateDebugPanel(msg, type);
    }
  }

  function updateDebugPanel(msg, type) {
    var panel = document.getElementById('yamli-v4-debug');
    if (!panel) return;
    
    var output = panel.querySelector('.debug-output');
    if (!output) return;
    
    var color = type === 'error' ? '#f66' : type === 'warn' ? '#ff6' : type === 'success' ? '#0f0' : '#0ff';
    var timestamp = new Date().toLocaleTimeString();
    var line = '<div style="color:' + color + '; margin:2px 0; border-left:2px solid ' + color + '; padding-left:5px;">' +
               '<span style="opacity:0.6; font-size:9px;">[' + timestamp + ']</span> ' + msg + '</div>';
    
    output.innerHTML += line;
    output.scrollTop = output.scrollHeight;
  }

  // ============================================
  // DEBUG PANEL
  // ============================================
  
  function createDebugPanel() {
    // Only create panel if debug mode is enabled
    if (!CONFIG.debug) return;
    
    var existing = document.getElementById('yamli-v4-debug');
    if (existing) existing.remove();
    
    var panel = document.createElement('div');
    panel.id = 'yamli-v4-debug';
    
    var positions = {
      'bottom-left': 'bottom:10px; left:10px;',
      'bottom-right': 'bottom:10px; right:10px;',
      'top-left': 'top:10px; left:10px;',
      'top-right': 'top:10px; right:10px;'
    };
    
    panel.style.cssText = 'position:fixed; ' + (positions[CONFIG.debugPanelPosition] || positions['bottom-left']) +
      'background:rgba(0,0,0,0.95); color:#0f0; padding:10px; font-size:11px; z-index:99999; ' +
      'width:' + CONFIG.debugPanelWidth + '; max-height:' + CONFIG.debugPanelMaxHeight + '; ' +
      'overflow:auto; font-family:monospace; border-radius:8px; border:2px solid #0f0; ' +
      'box-shadow:0 4px 20px rgba(0,0,0,0.5);';
    
    panel.innerHTML = 
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid #0f0;">' +
        '<b style="color:#ff0; font-size:13px;">🔧 Yamli Pro v4.0</b>' +
        '<span style="font-size:9px; color:#888;">' + (isAndroid() ? 'Android' : 'Desktop') + '</span>' +
      '</div>' +
      '<div class="debug-status" style="color:#ff6; margin-bottom:8px;">Initializing...</div>' +
      '<div class="debug-output" style="max-height:200px; overflow-y:auto;"></div>' +
      '<div style="margin-top:8px; padding-top:8px; border-top:1px solid #0f0; display:flex; gap:8px;">' +
        '<button onclick="YamliProHandler.test()" style="background:#0f0; color:#000; border:none; padding:4px 8px; cursor:pointer; font-size:10px; border-radius:3px;">Test</button>' +
        '<button onclick="YamliProHandler.clearLog()" style="background:#444; color:#fff; border:none; padding:4px 8px; cursor:pointer; font-size:10px; border-radius:3px;">Clear</button>' +
        '<button onclick="YamliProHandler.toggleDebug()" style="background:#444; color:#fff; border:none; padding:4px 8px; cursor:pointer; font-size:10px; border-radius:3px;">Toggle Debug</button>' +
      '</div>';
    
    document.body.appendChild(panel);
    
    // Make panel draggable
    var isDragging = false;
    var startX, startY, startLeft, startTop;
    
    panel.addEventListener('mousedown', function(e) {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      var rect = panel.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      panel.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      panel.style.left = (startLeft + dx) + 'px';
      panel.style.top = (startTop + dy) + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    });
    
    document.addEventListener('mouseup', function() {
      isDragging = false;
      panel.style.cursor = 'default';
    });
  }

  function updateStatus(msg) {
    var panel = document.getElementById('yamli-v4-debug');
    if (panel) {
      var status = panel.querySelector('.debug-status');
      if (status) status.textContent = msg;
    }
  }

  // ============================================
  // YAMLI MANAGER ACCESS
  // ============================================
  
  function getTextarea() {
    return document.getElementById(CONFIG.textareaId);
  }

  function getManager() {
    var textarea = getTextarea();
    if (!textarea) return null;
    return textarea.yamliManager || textarea._yamliManager || null;
  }

  function isMenuVisible() {
    var manager = getManager();
    if (manager && manager.isMenuVisible) {
      return manager.isMenuVisible();
    }
    return false;
  }

  function hideMenu() {
    var manager = getManager();
    if (manager) {
      // Try API method first
      if (manager.hideTransliterations) {
        try {
          manager.hideTransliterations();
          log('Menu hidden via hideTransliterations()', 'success');
          return true;
        } catch (e) {
          log('hideTransliterations failed: ' + e.message, 'error');
        }
      }
      if (manager.hideMenu) {
        try {
          manager.hideMenu();
          log('Menu hidden via hideMenu()', 'success');
          return true;
        } catch (e) {
          log('hideMenu failed: ' + e.message, 'error');
        }
      }
    }
    
    // Fallback: hide DOM element directly
    var menu = document.querySelector('.yamliapi_menuPanel, .yamliapi_menuContent, [class*="yamliapi_menu"]');
    if (menu) {
      menu.style.display = 'none';
      log('Menu hidden via DOM', 'success');
      return true;
    }
    
    return false;
  }

  // ============================================
  // APPROACH 1: Direct API Call
  // ============================================
  
  function approach1_DirectAPI() {
    log('Trying Approach 1: Direct API (hideTransliterations)', 'info');
    
    var manager = getManager();
    if (!manager) {
      log('✗ No manager available', 'error');
      return false;
    }
    
    if (!manager.hideTransliterations) {
      log('✗ hideTransliterations method not found', 'error');
      return false;
    }
    
    try {
      manager.hideTransliterations();
      log('✓ SUCCESS: hideTransliterations called', 'success');
      state.lastApproachUsed = 'Direct API';
      return true;
    } catch (e) {
      log('✗ hideTransliterations failed: ' + e.message, 'error');
      return false;
    }
  }

  // ============================================
  // APPROACH 2: Click DOM Element
  // ============================================
  
  function approach2_ClickDOM() {
    log('Trying Approach 2: Click DOM Element', 'info');
    
    // Find the menu container
    var menu = document.querySelector('.yamliapi_menuContent') ||
               document.querySelector('.yamliapi_menuPanel') ||
               document.querySelector('[class*="yamliapi_menu"]');
    
    if (!menu) {
      log('✗ Menu container not found', 'error');
      return false;
    }
    
    // Find all clickable items
    var allDivs = menu.querySelectorAll('div');
    var items = [];
    
    for (var i = 0; i < allDivs.length; i++) {
      var div = allDivs[i];
      var style = div.getAttribute('style') || '';
      var text = div.textContent.trim();
      
      // Look for clickable items with text
      if (style.indexOf('cursor: pointer') !== -1 && text && text.length > 0 && text.length < 50) {
        items.push(div);
      }
    }
    
    log('Found ' + items.length + ' clickable items', 'info');
    
    if (items.length === 0) {
      log('✗ No items found', 'error');
      return false;
    }
    
    // Target the first Arabic suggestion (index 1, or 0 if only 1 item)
    var targetIndex = Math.min(CONFIG.arabicIndex, items.length - 1);
    var target = items[targetIndex];
    
    log('Targeting item #' + targetIndex + ': "' + target.textContent.substring(0, 20) + '"', 'info');
    
    try {
      // Simulate the full click sequence
      var mousedown = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      target.dispatchEvent(mousedown);
      
      var click = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      target.dispatchEvent(click);
      
      log('✓ SUCCESS: Clicked DOM element', 'success');
      state.lastApproachUsed = 'DOM Click';
      return true;
    } catch (e) {
      log('✗ Click failed: ' + e.message, 'error');
      return false;
    }
  }

  // ============================================
  // APPROACH 3: Manager Methods Discovery
  // ============================================
  
  function approach3_ManagerMethods() {
    log('Trying Approach 3: Manager Method Discovery', 'info');
    
    var manager = getManager();
    if (!manager) {
      log('✗ No manager available', 'error');
      return false;
    }
    
    // List of potential method names to try
    var methodNames = [
      'acceptSuggestion',
      'selectSuggestion', 
      'selectItem',
      'acceptSelection',
      'useSuggestion',
      'chooseSuggestion',
      'setSelection',
      'onSuggestionClick',
      'handleSuggestion',
      'reportSelection',
      'select'
    ];
    
    for (var i = 0; i < methodNames.length; i++) {
      var methodName = methodNames[i];
      if (manager[methodName] && typeof manager[methodName] === 'function') {
        log('Found method: ' + methodName, 'info');
        try {
          // Try calling with the Arabic index
          var result = manager[methodName](CONFIG.arabicIndex);
          log('✓ SUCCESS: Called ' + methodName, 'success');
          state.lastApproachUsed = 'Method: ' + methodName;
          return true;
        } catch (e) {
          log('✗ ' + methodName + ' failed: ' + e.message, 'error');
        }
      }
    }
    
    log('✗ No working method found', 'error');
    return false;
  }

  // ============================================
  // APPROACH 4: Simulate Keyboard
  // ============================================
  
  function approach4_SimulateKeyboard() {
    log('Trying Approach 4: Simulate Keyboard Events', 'info');
    
    var textarea = getTextarea();
    if (!textarea) {
      log('✗ Textarea not found', 'error');
      return false;
    }
    
    try {
      // Keydown
      var kdEvt = new KeyboardEvent('keydown', {
        key: ' ',
        code: 'Space',
        keyCode: 32,
        which: 32,
        bubbles: true,
        cancelable: true
      });
      textarea.dispatchEvent(kdEvt);
      
      // Keypress (legacy)
      var kpEvt = new KeyboardEvent('keypress', {
        key: ' ',
        code: 'Space',
        keyCode: 32,
        which: 32,
        charCode: 32,
        bubbles: true,
        cancelable: true
      });
      textarea.dispatchEvent(kpEvt);
      
      // Keyup
      var kuEvt = new KeyboardEvent('keyup', {
        key: ' ',
        code: 'Space',
        keyCode: 32,
        which: 32,
        bubbles: true,
        cancelable: true
      });
      textarea.dispatchEvent(kuEvt);
      
      log('✓ SUCCESS: Dispatched keyboard events', 'success');
      state.lastApproachUsed = 'Keyboard Simulation';
      return true;
    } catch (e) {
      log('✗ Keyboard simulation failed: ' + e.message, 'error');
      return false;
    }
  }

  // ============================================
  // MAIN PROCESSING
  // ============================================
  
  function addTrailingSpace() {
    var textarea = getTextarea();
    if (!textarea) return;
    
    setTimeout(function() {
      var val = textarea.value;
      if (!val.endsWith(' ') && !val.endsWith('\u00A0')) {
        textarea.value = val + ' ';
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
        log('Added trailing space', 'success');
      }
    }, CONFIG.spaceDelayMs);
  }

  function processSpace(e) {
    if (state.processing) {
      log('Already processing, skipping', 'warn');
      return;
    }
    
    state.processing = true;
    log('=== SPACE DETECTED ===', 'info');
    
    // Check if we should handle this
    if (!isMenuVisible()) {
      log('Menu not visible, letting space through', 'info');
      state.processing = false;
      return;
    }
    
    log('Menu is visible, processing...', 'info');
    
    // Prevent default to stop space insertion
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Try approaches in order (prioritize Approach 4 since it works)
    var success = false;
    
    if (!success) success = approach4_SimulateKeyboard();  // Try this first - it works!
    if (!success) success = approach1_DirectAPI();
    if (!success) success = approach2_ClickDOM();
    if (!success) success = approach3_ManagerMethods();
    
    if (success) {
      state.successCount++;
      log('✓✓✓ SPACE HANDLED SUCCESSFULLY (Approach: ' + state.lastApproachUsed + ')', 'success');
      addTrailingSpace();
      
      // Hide the menu after selection
      setTimeout(function() {
        hideMenu();
      }, 50);
    } else {
      log('✗✗✗ All approaches exhausted', 'error');
    }
    
    state.processing = false;
  }

  // ============================================
  // ATTACHMENT & INITIALIZATION
  // ============================================
  
  function attachHandlers() {
    log('Attaching handlers...', 'info');
    
    var textarea = getTextarea();
    if (!textarea) {
      log('Textarea #' + CONFIG.textareaId + ' not found', 'error');
      return false;
    }
    
    // Remove existing handlers first
    textarea.removeEventListener('keydown', onKeydown, true);
    textarea.removeEventListener('beforeinput', onBeforeInput, true);
    textarea.removeEventListener('input', onInput);
    textarea.removeEventListener('compositionend', onCompositionEnd);
    
    // Attach keydown in capture phase (catches physical keys)
    textarea.addEventListener('keydown', onKeydown, true);
    
    // Attach beforeinput in capture phase (catches before insertion)
    textarea.addEventListener('beforeinput', onBeforeInput, true);
    
    // Attach input as backup (catches Android soft keyboard)
    textarea.addEventListener('input', onInput);
    
    // Attach compositionend (Android IME)
    textarea.addEventListener('compositionend', onCompositionEnd);
    
    // Also attach to document for more aggressive interception
    document.removeEventListener('keydown', onDocumentKeydown, true);
    document.addEventListener('keydown', onDocumentKeydown, true);
    
    state.attached = true;
    log('✓ Handlers attached (keydown, beforeinput, input, compositionend)', 'success');
    updateStatus('✓ Handler attached and ready');
    return true;
  }

  function onDocumentKeydown(e) {
    // Global space interception for aggressive catching
    var isSpace = e.key === ' ' || e.keyCode === 32 || e.which === 32 || 
                  e.code === 'Space' || (e.keyCode === 0 && e.key === 'Unidentified');
    
    if (isSpace && isMenuVisible()) {
      var target = e.target;
      var textarea = getTextarea();
      
      // Only intercept if targeting our textarea or within it
      if (target === textarea || (textarea && textarea.contains && textarea.contains(target))) {
        log('Document keydown: SPACE intercepted', 'info');
        e.preventDefault();
        e.stopImmediatePropagation();
        processSpace(e);
        return false;
      }
    }
  }

  var spacePressed = false;
  var lastValue = '';

  function onKeydown(e) {
    // Check multiple space identifiers (Android compatibility)
    var isSpace = e.key === ' ' || e.keyCode === 32 || e.which === 32 || 
                  e.code === 'Space' || (e.keyCode === 0 && e.key === 'Unidentified');
    
    if (isSpace) {
      spacePressed = true;
      log('keydown: SPACE captured (key=' + e.key + ', code=' + e.code + ')', 'info');
      
      // Only process if menu is visible
      if (isMenuVisible()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        processSpace(e);
        return false;
      }
    }
  }

  function onBeforeInput(e) {
    // Catch space before it's inserted
    if (e.data === ' ' || e.data === '\u00A0') {
      log('beforeinput: SPACE detected', 'info');
      
      if (isMenuVisible()) {
        e.preventDefault();
        processSpace(e);
        return false;
      }
    }
  }

  function onInput(e) {
    var textarea = getTextarea();
    if (!textarea) return;
    
    var val = textarea.value;
    var lastChar = val.slice(-1);
    
    // Detect space insertion
    if ((lastChar === ' ' || lastChar === '\u00A0') && !spacePressed) {
      // Space was inserted without keydown (Android soft keyboard)
      if (val.length > lastValue.length && isMenuVisible()) {
        log('input: SPACE detected (Android soft keyboard)', 'info');
        // Remove the space and process
        textarea.value = val.slice(0, -1);
        processSpace(null);
      }
    }
    
    spacePressed = false;
    lastValue = val;
  }

  function onCompositionEnd(e) {
    // Android often sends space after composition ends
    log('compositionend: ' + e.data, 'info');
    
    setTimeout(function() {
      var textarea = getTextarea();
      if (!textarea) return;
      
      var val = textarea.value;
      if (val.endsWith(' ') && isMenuVisible()) {
        log('Space after composition detected', 'info');
        textarea.value = val.slice(0, -1);
        processSpace(null);
      }
    }, 10);
  }

  function tryAttachWithRetry() {
    var textarea = getTextarea();
    var manager = getManager();
    
    if (textarea && manager) {
      log('Yamli ready, attaching...', 'success');
      attachHandlers();
      state.initialized = true;
      return;
    }
    
    state.attemptCount++;
    
    if (state.attemptCount < CONFIG.retryAttempts) {
      log('Waiting for Yamli... (attempt ' + state.attemptCount + '/' + CONFIG.retryAttempts + ')', 'info');
      updateStatus('Waiting for Yamli... (' + state.attemptCount + '/' + CONFIG.retryAttempts + ')');
      setTimeout(tryAttachWithRetry, CONFIG.retryDelayMs);
    } else {
      log('✗ Max retries reached. Yamli may not be initialized.', 'error');
      // Attach anyway to handle later initialization
      attachHandlers();
    }
  }

  function init(customConfig) {
    // Merge custom config
    if (customConfig) {
      for (var key in customConfig) {
        if (customConfig.hasOwnProperty(key)) {
          CONFIG[key] = customConfig[key];
        }
      }
    }
    
    // Only run on Android
    if (!isAndroid()) {
      log('Not Android, skipping initialization', 'info');
      return;
    }
    
    // Silent initialization for production
    
    // Start attachment process
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryAttachWithRetry);
    } else {
      tryAttachWithRetry();
    }
  }

  // ============================================
  // PUBLIC API
  // ============================================
  
  window.YamliProHandler = {
    // Configuration
    getConfig: function() {
      return JSON.parse(JSON.stringify(CONFIG));
    },
    
    setConfig: function(key, value) {
      CONFIG[key] = value;
      log('Config updated: ' + key + ' = ' + value, 'info');
    },
    
    // Debug
    setDebug: function(enabled) {
      CONFIG.debug = enabled;
      log('Debug logging ' + (enabled ? 'enabled' : 'disabled'), 'info');
    },
    
    toggleDebug: function() {
      this.setDebug(!CONFIG.debug);
    },
    
    // Testing
    test: function() {
      log('=== MANUAL TEST ===', 'info');
      processSpace(null);
    },
    
    testApproach: function(approachNum) {
      log('=== TESTING APPROACH ' + approachNum + ' ===', 'info');
      var success = false;
      switch(approachNum) {
        case 1: success = approach1_DirectAPI(); break;
        case 2: success = approach2_ClickDOM(); break;
        case 3: success = approach3_ManagerMethods(); break;
        case 4: success = approach4_SimulateKeyboard(); break;
        default: log('Invalid approach number', 'error');
      }
      if (success) {
        addTrailingSpace();
      }
      return success;
    },
    
    // State
    getState: function() {
      return JSON.parse(JSON.stringify(state));
    },
    
    // Initialization
    init: function(textareaId) {
      if (textareaId) {
        CONFIG.textareaId = textareaId;
      }
      state.attemptCount = 0;
      init();
    },
    
    // Reattach
    reattach: function() {
      log('Reattaching handlers...', 'info');
      var textarea = getTextarea();
      if (textarea) {
        // Clean up old listeners
        textarea.removeEventListener('keydown', onKeydown, true);
        textarea.removeEventListener('beforeinput', onBeforeInput, true);
        textarea.removeEventListener('input', onInput);
        textarea.removeEventListener('compositionend', onCompositionEnd);
      }
      document.removeEventListener('keydown', onDocumentKeydown, true);
      attachHandlers();
    },
    
    // Manager access
    getManager: getManager,
    isMenuVisible: isMenuVisible,
    
    // Clear log
    clearLog: function() {
      var output = document.querySelector('#yamli-v4-debug .debug-output');
      if (output) output.innerHTML = '';
    },
    
    // Version
    version: '1.0.0'
  };

  // Auto-initialize
  init();

})();
