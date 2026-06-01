import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Share, Dimensions } from 'react-native';
import ValkyriaLogo from './ValkyriaLogo';

interface LauncherDashboardProps {
  onNavigateToRecarga: () => void;
  onNavigateToSaldo: () => void;
}

export default function LauncherDashboard({
  onNavigateToRecarga,
  onNavigateToSaldo,
}: LauncherDashboardProps) {
  const [clock, setClock] = useState('SYNCING');
  const [ping, setPing] = useState(14);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const clockTimer = setInterval(updateTime, 1000);

    const pingTimer = setInterval(() => {
      setPing(prev => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(8, Math.min(22, prev + delta));
      });
    }, 4000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(pingTimer);
    };
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'VALKYRIA TACTICAL LAUNCHER - SYSTEM CONTROLLER: ON',
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.retroFrame}>
        {/* Top Status Panel */}
        <View style={styles.statusBar}>
          <Text style={styles.headerIndicator}>⚡ MOBILE_LINK_v4.2</Text>
          <Text style={styles.headerIndicator}>● NFC ACTIVE</Text>
        </View>

        {/* Central Core Branding */}
        <View style={styles.brandBox}>
          <ValkyriaLogo style={styles.miniLogo} />

          <Text style={styles.mainTitle}>VALKYRIA</Text>
          <Text style={styles.subTitle}>Tactical User Interface</Text>

          {/* Quick telemetry badge */}
          <View style={styles.telemetryBadge}>
            <Text style={styles.telemetryText}>
              CLOCK: {clock} | LATENCY: {ping}ms
            </Text>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          {/* Card 1: SALDO */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={onNavigateToSaldo}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.cardIcon}>💰</Text>
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardCommand}>CMD: EXTRACT_FUNDS</Text>
              <Text style={styles.cardTitle}>SALDO</Text>
              <Text style={styles.cardDesc}>
                Busca claves A/B de Mifare y decodifica el balance acumulado de
                tu cuenta.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Card 2: RECARGA */}
          <TouchableOpacity
            style={styles.menuCard}
            onPress={onNavigateToRecarga}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.cardIcon}>⚡</Text>
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.cardCommand}>CMD: INYECT_PAYLOAD</Text>
              <Text style={styles.cardTitle}>RECARGA</Text>
              <Text style={styles.cardDesc}>
                Escribe saldo redundante en el bloque 37/38 de la tarjeta Mifare
                Classic.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        

        {/* Console Footing progress */}
        <View style={styles.footerPanel}>
          <Text style={styles.footerStatus}>78.42% SYNCED COMPLETE</Text>
          <TouchableOpacity onPress={handleShare} activeOpacity={0.5}>
            <Text style={styles.shareText}>COMPARTIR CLÚSTER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#020203',
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'center',
    width: '100%',
    height: Dimensions.get('window').height,
  },
  retroFrame: {
    flex: 1,
    borderWidth: 3,
    borderColor: '#3c1800',
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  headerIndicator: {
    fontFamily: 'monospace',
    color: '#ff5500',
    fontSize: 9,
    fontWeight: 'bold',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  miniLogo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  mainTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  subTitle: {
    color: '#ffaa00',
    fontSize: 9,
    letterSpacing: 2,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  telemetryBadge: {
    backgroundColor: 'rgba(255, 85, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 85, 0, 0.25)',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 14,
  },
  telemetryText: {
    color: '#ff7700',
    fontFamily: 'monospace',
    fontSize: 8,
  },
  menuContainer: {
    gap: 16,
    flex: 1,
    justifyContent: 'center',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 85, 0, 0.3)',
    backgroundColor: 'rgba(255, 85, 0, 0.04)',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ff5500',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050506',
  },
  cardIcon: {
    fontSize: 18,
    color: '#ff5500',
  },
  cardTextContent: {
    flex: 1,
  },
  cardCommand: {
    color: '#ff6a1a',
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 1,
  },
  cardDesc: {
    color: '#94a3b8',
    fontSize: 9,
    marginTop: 4,
    lineHeight: 12,
  },
  footerPanel: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 85, 0, 0.15)',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerStatus: {
    color: 'rgba(255, 85, 0, 0.5)',
    fontFamily: 'monospace',
    fontSize: 8,
  },
  shareText: {
    color: '#ff5500',
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: 'bold',
  }
});
