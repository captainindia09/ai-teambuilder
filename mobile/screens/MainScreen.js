import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, BackHandler, SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

// ⚠️ CHANGE THIS to your deployed Vercel frontend URL
const WEB_URL = 'https://your-frontend.vercel.app';

export default function MainScreen({ onLogout }) {
  const webviewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webviewRef.current) { webviewRef.current.goBack(); return true; }
      return false;
    });
    return () => handler.remove();
  }, [canGoBack]);

  const handleNav = (navState) => {
    setCanGoBack(navState.canGoBack);
    if (navState.url.includes('/login')) onLogout();
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.brand}>⚡ TeamBuilder</Text>
        <TouchableOpacity onPress={onLogout}><Text style={s.logout}>Logout</Text></TouchableOpacity>
      </View>
      <WebView
        ref={webviewRef}
        source={{ uri: WEB_URL }}
        style={s.webview}
        onNavigationStateChange={handleNav}
        javaScriptEnabled domStorageEnabled startInLoadingState
        injectedJavaScript={`
          (function(){
            var s=document.createElement('style');
            s.textContent='.navbar{display:none!important}';
            document.head.appendChild(s);
          })(); true;
        `}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117', paddingTop: Platform.OS === 'android' ? 30 : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#151820', borderBottomWidth: 1, borderBottomColor: '#2a2d3a' },
  brand: { color: '#e4e4e7', fontSize: 18, fontWeight: '700' },
  logout: { color: '#8b8fa3', fontSize: 14 },
  webview: { flex: 1, backgroundColor: '#0f1117' },
});
