# Yamli Android Keyboard

A lightweight Android input method that integrates Yamli's Arabic transliteration with auto-selection on spacebar.

## Features

- **Spacebar auto-selection**: Press space to select the first Arabic suggestion
- **Auto-hide menu**: Menu disappears after selection
- **4-Approach fallback strategy**: Ensures reliable selection across devices
- **Lightweight**: Minimal native code, HTML/JS-based UI
- **WebView-based**: Uses Yamli's official API

## Project Structure

```
android-keyboard/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/com/yamlimobile/keyboard/
│   │   │   ├── YamliKeyboardService.java
│   │   │   └── SettingsActivity.java
│   │   ├── res/
│   │   │   ├── xml/method.xml
│   │   │   └── values/styles.xml
│   │   └── assets/
│   │       └── yamli_keyboard.html
│   └── build.gradle
├── build.gradle
└── settings.gradle
```

## Build Instructions

1. Install Android Studio
2. Open this folder in Android Studio
3. Build → Build Bundle(s) / APK(s) → Build APK(s)
4. Install on Android device

## Usage

1. Install the APK
2. Go to Settings → Languages & Input → Virtual Keyboard → Manage Keyboards
3. Enable "Yamli Keyboard"
4. Tap any text field, pull down notification shade, select "Input method" → "Yamli Keyboard"

## Technical Details

- **minSdk**: 21 (Android 5.0)
- **targetSdk**: 34
- **Size**: ~500KB (without Yamli assets)
- **Permissions**: INTERNET (for Yamli API)

## Spacebar Handler

The keyboard includes the v1.0 spacebar handler that:
1. Detects Yamli suggestion menu visibility
2. Clicks the first Arabic suggestion (index 1)
3. Adds trailing space
4. Hides the menu

## Limitations

- Requires internet connection for Yamli API
- WebView-based (not native keyboard keys)
- Cannot integrate with Gboard (separate input method)

## License

Same as YamliMobile project
