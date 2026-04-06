# YAMLI ANDROID SPACEBAR HANDLER - TECHNICAL REPORT

## Problem Statement

Implement a robust Android space key handler for Yamli Arabic transliteration that auto-selects the first Arabic suggestion when space is pressed on Android devices. The handler must work across all Android keyboards (Gboard, Samsung, SwiftKey) and browsers (Chrome, Samsung Internet, Firefox).

## Current Status

Multiple attempts have been made (v1.0, v2.0, v2.1, v3.0) with varying strategies. The current implementation (v3.0) uses Direct API Communication but still has issues.

## Yamli API Structure Analysis

### API Source Code Insights
From analyzing `https://api.yamli.com/js/yamli_api.js`:

1. **Main API Object**: `window.Yamli` (aliased as `i` internally)
2. **Textarea Attachment**: Each yamlified textarea gets `textarea.yamliManager`
3. **Manager Methods** (from API source):
   - `isMenuVisible()` - Check if dropdown is showing
   - `hideTransliterations()` - Accept current suggestion and close menu
   - `getSelection()` - Get current word selection info
   - `getInput()` - Get the textarea element
   - Internal event handlers: `pb` (keydown), `sb` (keypress), `Lb` (keyup)

4. **Menu Structure** (from DOM inspection):
   - Container: `.yamliapi_menuContent` or `.yamliapi_menuPanel`
   - Items: `div` elements with `style="cursor: pointer"`
   - Selected item: Has `background-color: rgb(198, 216, 255)` (darker blue)
   - First item is English input, second item is first Arabic suggestion

### API Initialization Flow
```javascript
// 1. Load Yamli API
<script src="https://api.yamli.com/js/yamli_api.js"></script>

// 2. Initialize
Yamli.init({ uiLanguage: "ar", startMode: "onOrUserDefault", ... })

// 3. Yamlify textarea
Yamli.yamlify("textbox_id_1", { settingsPlacement: 'inside', ... })

// 4. Manager is attached to textarea as textarea.yamliManager
```

## Attempted Solutions

### v1.0 - Basic DOM Clicking
- Query DOM for `.yamli-suggestion-item` elements
- Click first element on space
- **Failed**: Selectors didn't match actual Yamli classes

### v2.0 - Enhanced DOM Detection
- Multiple selector strategies
- Background color detection for selected item
- Retry logic for dynamic menu
- **Failed**: Items found but clicking didn't trigger API selection

### v2.1 - Retry and Better Selectors
- Added detailed logging
- Multiple fallback strategies
- Wait for items to populate
- **Failed**: "Found 0 suggestions" - timing issue

### v3.0 - Direct API Communication (Current)
- Access `textarea.yamliManager` directly
- Check `manager.isMenuVisible()`
- Dispatch keyboard events (keydown/keypress/keyup) with keyCode 32
- Let API handle selection internally
- **Status**: Needs testing/debugging

## Key Technical Challenges

1. **Timing Issue**: Menu is visible but items not yet populated when space is detected
2. **Event Order**: Yamli API attaches its own handlers - need to intercept before or trigger after
3. **Android Keyboard Variations**: Different keyboards trigger different events (keydown vs input)
4. **API Internals**: The API likely has internal state that needs to be in sync with DOM

## Current Implementation (v3.0)

```javascript
// Capture space in capture phase
textarea.addEventListener('keydown', function(e) {
  if (e.key === ' ' || e.keyCode === 32) {
    var manager = textarea.yamliManager;
    if (manager && manager.isMenuVisible()) {
      e.preventDefault();
      e.stopPropagation();
      
      // Dispatch full key sequence to let API handle it
      var kdEvt = document.createEvent('KeyboardEvent');
      kdEvt.initKeyboardEvent('keydown', true, true, window, 'Space', 0, false, false, false, false, 32);
      Object.defineProperty(kdEvt, 'keyCode', { value: 32 });
      textarea.dispatchEvent(kdEvt);
      // ... keypress, keyup
    }
  }
}, true); // Capture phase
```

## Debug Information Available

Debug panel shows (bottom-left):
- "Yamli manager found" or "Yamli not initialized yet"
- "Menu is visible" or "Menu not visible"
- "API space sequence dispatched"

Console shows (DevTools):
- `[YamliPro]` prefix messages
- Full API object via `window.YamliProHandler`
- Manual test: `YamliProHandler.test()`

## Potential Root Causes

1. **Handler attaches before Yamli initializes** - `yamliManager` not available yet
2. **Wrong event type** - API expects different event structure
3. **Missing internal state** - API needs certain conditions to process space
4. **Capture phase not working** - Yamli still intercepts first

## Files in Project

- `c:\Users\elmok\OneDrive\Documents\GitHub\yamlimobile\index.html` - Main file with handler
- `c:\Users\elmok\OneDrive\Documents\GitHub\yamlimobile\yamli_handler_v3.js` - Backup of v3.0 handler

## Test URL

Live: `https://elmokhtarmchich.github.io/yamlimobile/`

---

## PROMPT FOR CLAUDE CODE

```
I need you to fix a Yamli Android spacebar handler issue. The handler should auto-select the first Arabic suggestion when space is pressed on Android devices.

PROBLEM:
- Yamli API is loaded from https://api.yamli.com/js/yamli_api.js
- Textarea gets yamlified and has textarea.yamliManager attached
- Current v3.0 handler tries to dispatch keyboard events but doesn't work
- The menu shows suggestions but space doesn't select them

FILE TO EDIT:
c:\Users\elmok\OneDrive\Documents\GitHub\yamlimobile\index.html

CURRENT IMPLEMENTATION (lines ~397-605):
The handler attaches in capture phase, checks yamliManager.isMenuVisible(), then dispatches keydown/keypress/keyup events with keyCode 32.

WHAT YOU NEED TO DO:
1. First, understand how Yamli API handles space internally by examining the API source structure:
   - textarea.yamliManager has internal methods
   - The API attaches its own keydown/keypress/keyup handlers
   - Space selection is handled in the API's internal "pb" function (keydown handler)

2. Test different approaches:
   a) Check if yamliManager has a direct method to accept current suggestion (like acceptSelection or similar)
   b) Try calling yamliManager.hideTransliterations() when space is pressed (this should accept and close)
   c) Experiment with dispatching events TO the yamliManager's internal handlers instead of the textarea
   d) Try preventing Yamli's handler and manually triggering the selection logic

3. Key requirements:
   - Must work on Android with soft keyboards
   - Must handle the first Arabic suggestion (second item in list, index 1)
   - Must add trailing space after selection
   - Must have debug panel visible for troubleshooting

4. Debug the issue:
   - Add console logging to see what's happening
   - Check if yamliManager exists and what methods it has
   - Test if isMenuVisible() returns true when expected
   - Verify events are being dispatched

5. The solution should:
   - Either use a direct API method if available
   - OR properly simulate what Yamli expects for space handling
   - OR intercept Yamli's internal flow and inject the selection

TESTING:
- Open the file in browser
- Type "marhaba" in the textarea
- When suggestions appear, press space
- Check debug panel for messages
- Should see Arabic selected with trailing space

Please provide a working implementation that solves this. You can try multiple approaches and iterate based on what you discover about the API internals.
```

## Additional Notes for Claude Code

1. The API source shows these internal patterns:
   - Event handlers are attached with `i.I.addEvent(b, "keydown", pb, true)` where `b` is the textarea
   - `pb` is the internal keydown handler
   - `xa(e)` is called to prevent default
   - The API checks `yc(a)` for key codes

2. The manager object (yamliManager) has these visible methods:
   - isMenuVisible()
   - hideTransliterations() 
   - getSelection()
   - getInput()
   - focusInput()
   - setSelection()

3. Consider that the issue might be:
   - Timing (need to wait for manager to be ready)
   - Event order (need to let Yamli process space but force the right selection)
   - Missing API call (there might be an internal method we need to call)

4. One potential approach: 
   - Don't intercept space at all
   - Let Yamli handle it naturally
   - But ensure the right item is "focused/selected" before space hits
   - OR manually call the selection after Yamli processes

---

END OF REPORT
