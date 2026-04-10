package com.yamlimobile.keyboard;

import android.inputmethodservice.InputMethodService;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class YamliKeyboardService extends InputMethodService {
    private WebView webView;
    private YamliInputConnection inputConnection;

    @Override
    public void onCreate() {
        super.onCreate();
    }

    @Override
    public View onCreateInputView() {
        webView = new WebView(this);
        setupWebView();
        return webView;
    }

    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient());
        
        // Add JavaScript interface for text input
        webView.addJavascriptInterface(new YamliInterface(), "YamliKeyboard");
        
        // Load the Yamli mobile page
        webView.loadUrl("file:///android_asset/yamli_keyboard.html");
    }

    public class YamliInterface {
        @JavascriptInterface
        public void onTextChanged(String text) {
            if (getCurrentInputConnection() != null) {
                getCurrentInputConnection().setComposingText(text, text.length());
            }
        }

        @JavascriptInterface
        public void onCommitText(String text) {
            if (getCurrentInputConnection() != null) {
                getCurrentInputConnection().commitText(text, text.length());
            }
        }

        @JavascriptInterface
        public void onKeyEvent(int keyCode) {
            if (getCurrentInputConnection() != null) {
                sendDownUpKeyEvents(keyCode);
            }
        }

        @JavascriptInterface
        public void onBackspace() {
            if (getCurrentInputConnection() != null) {
                getCurrentInputConnection().deleteSurroundingText(1, 0);
            }
        }

        @JavascriptInterface
        public void onEnter() {
            if (getCurrentInputConnection() != null) {
                sendDownUpKeyEvents(android.view.KeyEvent.KEYCODE_ENTER);
            }
        }
    }

    @Override
    public void onStartInput(EditorInfo attribute, boolean restarting) {
        super.onStartInput(attribute, restarting);
    }

    @Override
    public void onFinishInput() {
        super.onFinishInput();
    }
}
