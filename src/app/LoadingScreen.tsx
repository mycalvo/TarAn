import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Animated, Dimensions } from 'react-native';
import ValkyriaLogo from './ValkyriaLogo';

interface LoadingScreenProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  { p: 5, t: "SYSTEM VER: VALK-V8.42_STABLE" },
  { p: 12, t: "ESTABLISHING ENCRYPTED SHELL CONNECTIVITY..." },
  { p: 25, t: "DEFLATING WING CORES & NEON SHADOW BUFFERS [OK]" },
  { p: 38, t: "LOADING CYBERPUNK CHASSIS MATRIX INFRASTRUCTURE..." },
  { p: 48, t: "CONNECTING TO DISTRIBUTED VALK-NET LEDGER..." },
  { p: 62, t: "OVERCLOCKING CORES TO 9.8 GHz (VOLTAGE: 1.42V) [WARNING]" },
  { p: 75, t: "SYNCHRONIZING SECURE RECHARGE ROUTERS WITH BLOCKCHAIN..." },
  { p: 89, t: "BYPASSING CENTRAL GATEWAY FIREWALLS [SUCCESS]" },
  { p: 98, t: "INITIALIZATION COMPLETE. READY FOR PILOT COGNITIVE SYNC." }
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [historyLogs, setHistoryLogs] = useState<string[]>([]);
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Elegant loading timer logic
    const duration = 2500; // Fast and functional 2.5s loading time
    const intervalTime = 30; // ms per step
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + step + Math.random() * 2, 100);

        // Find corresponding log
        const logsToShow = BOOT_LOGS.filter(log => log.p <= next);
        if (logsToShow.length > 0) {
          setHistoryLogs(logsToShow.map(l => l.t));
        }

        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 300); // Small pause for pilot feedback
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Top Header telemetry */}
      <View style={styles.header}>
        <Text style={styles.headerText}>VALKYRIA CORE UNIT v8.42</Text>
        <Text style={styles.headerText}>STABLE_SYNC_ACTIVE</Text>
      </View>

      {/* Main content centered */}
      <View style={styles.middle}>
        <ValkyriaLogo style={styles.logo} />

        <Text style={styles.title}>VALKYRIA</Text>
        <Text style={styles.subtitle}>Tactical Launcher Terminal</Text>

        {/* Loading Bar Container */}
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: widthInterpolate }]}>
            <View style={styles.glowEdge} />
          </Animated.View>
          <Text style={styles.progressPct}>{Math.round(progress)}%</Text>
        </View>

        {/* Hardware nodes specs dashboard */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}><Text style={styles.statText}>CORE: OK</Text></View>
          <View style={styles.statBox}><Text style={styles.statText}>SEC: ENCRYPTED</Text></View>
          <View style={styles.statBox}><Text style={styles.statText}>LAT: 12MS</Text></View>
          <View style={styles.statBox}><Text style={styles.statText}>DB: ONLINE</Text></View>
        </View>
      </View>

      {/* Mini scroll logs at bottom */}
      <View style={styles.logContainer}>
        <Text style={styles.logHeader}>REAL-TIME SHELL FEED</Text>
        <View style={styles.logList}>
          {historyLogs.slice(-3).map((log, idx) => (
            <View key={idx} style={styles.logRow}>
              <Text style={styles.logPrefix}>&gt;&gt;</Text>
              <Text style={styles.logText} numberOfLines={1}>{log}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer System Details */}
      <View style={styles.footer}>
        <Text style={styles.copyright}>© {new Date().getFullYear()} VALKYRIA TECHNOLOGIES</Text>
        <Text style={styles.secureWatermark}>SECURE LINK PROTOCOL</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020203',
    padding: 20,
    justifyContent: 'space-between',
    width: '100%',
    height: Dimensions.get('window').height,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 85, 0, 0.2)',
    paddingBottom: 8,
    marginTop: 10,
  },
  headerText: {
    color: 'rgba(255, 85, 0, 0.7)',
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1,
  },
  middle: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#ff6a1a',
    fontSize: 10,
    letterSpacing: 3,
    fontFamily: 'monospace',
    marginTop: 6,
    marginBottom: 35,
    textTransform: 'uppercase',
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 85, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 0, 0.3)',
    borderRadius: 6,
    padding: 1.5,
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ff5500',
    borderRadius: 4,
    position: 'relative',
  },
  glowEdge: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#ffffff',
  },
  progressPct: {
    position: 'absolute',
    right: 12,
    top: -22,
    color: '#ff5500',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statBox: {
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 0, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(7, 7, 8, 0.5)',
    flex: 1,
    alignItems: 'center',
  },
  statText: {
    color: 'rgba(255, 85, 0, 0.7)',
    fontFamily: 'monospace',
    fontSize: 8,
  },
  logContainer: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 85, 0, 0.15)',
    backgroundColor: '#050506',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  logHeader: {
    color: 'rgba(255, 85, 0, 0.4)',
    fontSize: 8,
    fontFamily: 'monospace',
    letterSpacing: 1.5,
    marginBottom: 6,
    textAlign: 'right',
  },
  logList: {
    gap: 4,
  },
  logRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  logPrefix: {
    color: '#ff5500',
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: 'bold',
  },
  logText: {
    color: 'rgba(255, 85, 0, 0.8)',
    fontFamily: 'monospace',
    fontSize: 9,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 85, 0, 0.15)',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyright: {
    color: 'rgba(255, 85, 0, 0.4)',
    fontFamily: 'monospace',
    fontSize: 8,
  },
  secureWatermark: {
    color: 'rgba(255, 85, 0, 0.4)',
    fontFamily: 'monospace',
    fontSize: 8,
    letterSpacing: 0.5,
  },
});
