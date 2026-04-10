package com.yamlimobile.keyboard;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.TextView;

public class SettingsActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Simple UI
        TextView textView = new TextView(this);
        textView.setText("Yamli Keyboard\n\nEnable keyboard in settings, then select it as input method.");
        textView.setPadding(50, 50, 50, 50);
        textView.setTextSize(18);
        
        Button enableButton = new Button(this);
        enableButton.setText("Enable Keyboard");
        enableButton.setOnClickListener(v -> {
            Intent intent = new Intent(Settings.ACTION_INPUT_METHOD_SETTINGS);
            startActivity(intent);
        });
        
        Button selectButton = new Button(this);
        selectButton.setText("Select Keyboard");
        selectButton.setOnClickListener(v -> {
            InputMethodManager imm = (InputMethodManager) getSystemService(INPUT_METHOD_SERVICE);
            imm.showInputMethodPicker();
        });
        
        // Layout
        android.widget.LinearLayout layout = new android.widget.LinearLayout(this);
        layout.setOrientation(android.widget.LinearLayout.VERTICAL);
        layout.addView(textView);
        layout.addView(enableButton);
        layout.addView(selectButton);
        
        setContentView(layout);
    }
}
