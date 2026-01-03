package com.example.wifiscanner;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class WifiBridge extends ReactContextBaseJavaModule {
    
    static {
        System.loadLibrary("wifimonster");
    }
    
    public WifiBridge(ReactApplicationContext reactContext) {
        super(reactContext);
    }
    
    @Override
    public String getName() {
        return "WifiBridge";
    }
    
    // ========== ONLY 5 METHODS - सब कुछ इनसे होगा ==========
    
    // 1. Initialize (सबसे पहले call करो)
    @ReactMethod
    public void initialize(String interfaceName, Promise promise) {
        try {
            boolean result = nativeInitialize(interfaceName);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("INIT_ERROR", e.getMessage());
        }
    }
    
    // 2. Scan WiFi (सारे networks दिखाओ)
    @ReactMethod
    public void scan(Promise promise) {
        try {
            String result = nativeScan();
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("SCAN_ERROR", e.getMessage());
        }
    }
    
    // 3. Attack WiFi (ONE CLICK - सब कुछ automatically)
    @ReactMethod
    public void attack(String bssid, String ssid, Promise promise) {
        try {
            String result = nativeAttack(bssid, ssid);
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ATTACK_ERROR", e.getMessage());
        }
    }
    
    // 4. Get status (सब ठीक है या नहीं)
    @ReactMethod
    public void getStatus(Promise promise) {
        try {
            String result = nativeGetStatus();
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("STATUS_ERROR", e.getMessage());
        }
    }
    
    // 5. Test connection (सब connect है या नहीं)
    @ReactMethod
    public void test(Promise promise) {
        try {
            String result = nativeTest();
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("TEST_ERROR", e.getMessage());
        }
    }
    
    // ========== NATIVE METHODS ==========
    private native boolean nativeInitialize(String interfaceName);
    private native String nativeScan();
    private native String nativeAttack(String bssid, String ssid);
    private native String nativeGetStatus();
    private native String nativeTest();
}