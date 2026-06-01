/**
 * 
 * @brief Función principal que maneja las ventanas de la aplicación.
 * @author Snoker - Guillermo Servent Mezquita
 * @version 1.0
 * @pre Esto es para los prerequisitos de ejecución de una función
 * @param valor1 Valor 1 de una función
 * @param valor2 Valor 2 de una función
 * @return Valor devuelto por una función.
 */
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  BackHandler,
} from "react-native";
import LoadingScreen from "./LoadingScreen";
import LauncherDashboard from "./LauncherDashboard";
import Recarga from "./Recarga";
import Saldo from "./Saldo";
import { ScreenType } from "./types";

export default function App() {
  const [screen, setScreen] = useState<ScreenType>("LOADING");

  const handleLoadingComplete = () => {
    setScreen("DASHBOARD");
  };

  // Manejador para el botón físico de "Atrás" en Android
  useEffect(() => {
    const backAction = () => {
      if (screen === "RECARGA" || screen === "SALDO") {
        setScreen("DASHBOARD");
        return true; // Previene que la app se cierre
      }
      return false; // Deja que el comportamiento por defecto ocurra (cerrar la app) si está en el Dashboard
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, [screen]);

  // Renderizado condicional más limpio basado en el estado
  const renderScreen = () => {
    switch (screen) {
      case "LOADING":
        return <LoadingScreen onComplete={handleLoadingComplete} />;
      case "DASHBOARD":
        return (
          <LauncherDashboard
            onNavigateToRecarga={() => setScreen("RECARGA")}
            onNavigateToSaldo={() => setScreen("SALDO")}
          />
        );
      case "RECARGA":
        return <Recarga onBack={() => setScreen("DASHBOARD")} />;
      case "SALDO":
        return <Saldo onBack={() => setScreen("DASHBOARD")} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#020203" />

        {/* Soft Ambient Glows */}
        <View style={styles.glowTop} pointerEvents="none" />
        <View style={styles.glowBottom} pointerEvents="none" />

        {/* Montaje de la pantalla activa */}
        {renderScreen()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020203",
  },
  container: {
    flex: 1,
    backgroundColor: "#020203",
    position: "relative",
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    top: -150,
    left: "10%",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 85, 0, 0.05)",
  },
  glowBottom: {
    position: "absolute",
    bottom: -150,
    right: "10%",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 51, 0, 0.04)",
  },
});
