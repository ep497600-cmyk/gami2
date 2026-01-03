import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { NativeModules } from 'react-native';

const { WifiBridge } = NativeModules;

export default function App() {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attacking, setAttacking] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [connected, setConnected] = useState(false);

  // Step 1: Initialize system
  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    try {
      setStatus('Initializing system...');
      const testResult = await WifiBridge.test();
      console.log('Test:', testResult);
      
      const initResult = await WifiBridge.initialize('wlan0');
      if (initResult) {
        setConnected(true);
        setStatus('System ready! Tap SCAN to find networks');
      } else {
        setStatus('Initialization failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not initialize: ' + error.message);
      setStatus('Error - Check root access');
    }
  };

  // Step 2: Scan networks
  const scanNetworks = async () => {
    if (!connected) {
      Alert.alert('Not Connected', 'Initialize system first');
      return;
    }

    setLoading(true);
    setStatus('Scanning for WiFi networks...');
    
    try {
      const result = await WifiBridge.scan();
      const data = JSON.parse(result);
      
      if (data.networks && Array.isArray(data.networks)) {
        setNetworks(data.networks);
        setStatus(`Found ${data.networks.length} networks`);
        
        // Auto-attack vulnerable networks
        const vulnerable = data.networks.filter(n => n.wps === true);
        if (vulnerable.length > 0) {
          Alert.alert(
            'Vulnerable Networks Found',
            `Found ${vulnerable.length} networks with WPS enabled. Attack them?`,
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Attack All', onPress: () => attackAll(vulnerable) }
            ]
          );
        }
      } else {
        Alert.alert('Scan Error', data.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Scan Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Attack a network (ONE CLICK)
  const attackNetwork = async (network) => {
    if (!connected || attacking) return;
    
    setAttacking(true);
    setStatus(`Attacking ${network.ssid || 'Hidden'}...`);
    
    Alert.alert(
      'Confirm Attack',
      `Attack ${network.ssid || 'Hidden Network'}?\nBSSID: ${network.bssid}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'ATTACK',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await WifiBridge.attack(network.bssid, network.ssid || 'Hidden');
              const data = JSON.parse(result);
              
              Alert.alert(
                'Attack Result',
                `Target: ${network.ssid || 'Hidden'}\n` +
                `Status: ${data.attack_report.crack_result.success ? 'SUCCESS' : 'FAILED'}\n` +
                `Method: ${data.attack_report.crack_result.method || 'Unknown'}`,
                [
                  { text: 'OK' },
                  data.attack_report.crack_result.success && {
                    text: 'Show Password',
                    onPress: () => {
                      Alert.alert(
                        'PASSWORD FOUND!',
                        `Network: ${network.ssid || 'Hidden'}\n` +
                        `Password: ${data.attack_report.crack_result.password}\n` +
                        `Tries: ${data.attack_report.crack_result.tried}`
                      );
                    }
                  }
                ].filter(Boolean)
              );
              
              setStatus('Attack completed');
              
            } catch (error) {
              Alert.alert('Attack Failed', error.message);
              setStatus('Attack failed');
            } finally {
              setAttacking(false);
            }
          }
        }
      ]
    );
  };

  // Attack all vulnerable networks
  const attackAll = async (vulnerableNetworks) => {
    setAttacking(true);
    setStatus(`Attacking ${vulnerableNetworks.length} networks...`);
    
    for (const network of vulnerableNetworks) {
      try {
        await WifiBridge.attack(network.bssid, network.ssid || 'Hidden');
        console.log(`Attacked ${network.ssid || 'Hidden'}`);
      } catch (error) {
        console.error(`Failed to attack ${network.ssid}:`, error);
      }
    }
    
    setAttacking(false);
    setStatus('Batch attack completed');
    Alert.alert('Batch Attack', 'Finished attacking all vulnerable networks');
  };

  // Get system status
  const checkStatus = async () => {
    try {
      const result = await WifiBridge.getStatus();
      const data = JSON.parse(result);
      Alert.alert('System Status', JSON.stringify(data, null, 2));
    } catch (error) {
      Alert.alert('Status Error', error.message);
    }
  };

  // Render network item
  const renderNetwork = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.networkCard,
        item.wps && styles.vulnerableCard,
        item.hidden && styles.hiddenCard
      ]}
      onPress={() => attackNetwork(item)}
      disabled={attacking}
    >
      <View style={styles.networkHeader}>
        <Text style={styles.networkName} numberOfLines={1}>
          {item.ssid || '[Hidden Network]'}
        </Text>
        <View style={styles.securityBadge}>
          <Text style={styles.securityText}>{item.security}</Text>
        </View>
      </View>
      
      <Text style={styles.networkBssid}>{item.bssid}</Text>
      
      <View style={styles.networkDetails}>
        <Text style={styles.detailText}>Signal: {item.rssi} dBm</Text>
        <Text style={styles.detailText}>Channel: {item.channel}</Text>
      </View>
      
      {item.wps && (
        <View style={styles.wpsBadge}>
          <Text style={styles.wpsText}>⚠️ WPS VULNERABLE</Text>
        </View>
      )}
      
      {item.hidden && (
        <Text style={styles.hiddenText}>🔒 Hidden SSID</Text>
      )}
      
      <TouchableOpacity
        style={styles.attackButton}
        onPress={() => attackNetwork(item)}
        disabled={attacking}
      >
        <Text style={styles.attackButtonText}>
          {attacking ? 'ATTACKING...' : 'LAUNCH ATTACK'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WiFi Monster 🚀</Text>
        <Text style={styles.headerSubtitle}>Advanced WiFi Security Tool</Text>
      </View>
      
      {/* Status Bar */}
      <View style={[styles.statusBar, !connected && styles.statusError]}>
        <Text style={styles.statusText}>
          {connected ? '✅ SYSTEM READY' : '❌ SYSTEM OFFLINE'}
        </Text>
        <Text style={styles.statusMessage}>{status}</Text>
      </View>
      
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.scanButton]}
          onPress={scanNetworks}
          disabled={loading || attacking || !connected}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>SCAN NETWORKS</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.statusButton]}
          onPress={checkStatus}
        >
          <Text style={styles.buttonText}>SYSTEM STATUS</Text>
        </TouchableOpacity>
      </View>
      
      {/* Networks List */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>
          Available Networks ({networks.length})
        </Text>
        
        {networks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {connected 
                ? 'No networks found. Tap SCAN to search.'
                : 'System not connected. Check initialization.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={networks}
            renderItem={renderNetwork}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {attacking ? '⚡ ATTACK IN PROGRESS...' : 'Ready for action'}
        </Text>
        {attacking && <ActivityIndicator color="#FF0000" style={styles.footerSpinner} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 15,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00FF00',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 5,
  },
  statusBar: {
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#00FF00',
  },
  statusError: {
    borderColor: '#FF0000',
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusMessage: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    backgroundColor: '#0066FF',
    marginRight: 10,
  },
  statusButton: {
    backgroundColor: '#666666',
    marginLeft: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#888888',
    textAlign: 'center',
    fontSize: 16,
  },
  networkCard: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  vulnerableCard: {
    borderColor: '#FF0000',
    backgroundColor: '#2A0000',
  },
  hiddenCard: {
    borderColor: '#FF9900',
  },
  networkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  networkName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  securityBadge: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  securityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  networkBssid: {
    color: '#888888',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  networkDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  wpsBadge: {
    backgroundColor: '#FF0000',
    padding: 6,
    borderRadius: 4,
    marginBottom: 10,
  },
  wpsText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  hiddenText: {
    color: '#FF9900',
    fontSize: 12,
    marginBottom: 10,
  },
  attackButton: {
    backgroundColor: '#FF0000',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  attackButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  footerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  footerSpinner: {
    marginLeft: 10,
  },
});