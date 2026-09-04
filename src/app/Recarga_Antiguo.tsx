import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
// Importamos la lógica de NFC
import NfcManager, { NfcTech } from "react-native-nfc-manager";

// Claves de seguridad extraídas de recarga_orig
const KEY_B = "6C8B8827F346"; //older: A4A00F81020E

interface RecargaProps {
  onBack: () => void;
}

interface RechargePackage {
  id: string;
  amount: number;
  bonus: string;
  price: string;
  currency: string;
}

const RECHARGE_PACKAGES: RechargePackage[] = [
  {
    id: "1",
    amount: 5,
    bonus: "Llavero Estándar",
    price: "5.00",
    currency: "EUR",
  },
  {
    id: "2",
    amount: 15,
    bonus: "Tarjeta Tarifa Plana",
    price: "15.00",
    currency: "EUR",
  },
  {
    id: "3",
    amount: 30,
    bonus: "Pase Viajes Ilimitados",
    price: "30.00",
    currency: "EUR",
  },
  {
    id: "4",
    amount: 50,
    bonus: "Crédito Máximo Configurable",
    price: "50.00",
    currency: "EUR",
  },
];

export default function Recarga({ onBack }: RecargaProps) {
  const [selectedPack, setSelectedPack] = useState<RechargePackage>(
    RECHARGE_PACKAGES[1],
  );
  const [customAmount, setCustomAmount] = useState<string>("15.00");
  const [isUsingCustom, setIsUsingCustom] = useState<boolean>(true);
  const [status, setStatus] = useState<"IDLE" | "PROCESSING" | "SUCCESS">(
    "IDLE",
  );
  const [generatedBytesHex, setGeneratedBytesHex] = useState<string>("");

  // Inicializar NFC al montar el componente
  useEffect(() => {
    NfcManager.start();
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => 0);
    };
  }, []);

  // Helper: Transforma hex string a array de bytes (de recarga_orig)
  const hexStringToHexArray = (hexString: string): number[] => {
    const bytes = [];
    for (let i = 0; i < hexString.length; i += 2) {
      bytes.push(parseInt(hexString.substring(i, i + 2), 16));
    }
    return bytes;
  };

  const generateMifareData = (saldo: number): number[] => {
    // Fórmula exacta: ((saldo * 100) * 2) + 1
    const valorEntero = Math.trunc(saldo * 100 * 2) + 1;

    // Extraemos bytes (Little Endian)
    const b1 = valorEntero & 0xff;
    const b2 = (valorEntero >> 8) & 0xff;
    const b3 = (valorEntero >> 16) & 0xff;
    const b4 = (valorEntero >> 24) & 0xff;

    const nb1 = ~b1 & 0xff;
    const nb2 = ~b2 & 0xff;
    const nb3 = ~b3 & 0xff;
    const nb4 = ~b4 & 0xff;

    return [
      b1,
      b2,
      b3,
      b4,
      nb1,
      nb2,
      nb3,
      nb4,
      b1,
      b2,
      b3,
      b4,
      0x00,
      0xff,
      0x00,
      0xff,
    ];
  };

  const handleInyeccion = async () => {
    const finalAmount = isUsingCustom
      ? parseFloat(customAmount.replace(",", "."))
      : parseFloat(selectedPack.price);

    if (isNaN(finalAmount) || finalAmount <= 0) {
      Alert.alert("Error", "Por favor introduce un saldo de recarga válido.");
      return;
    }

    const dataToWrite = generateMifareData(finalAmount);
    // Para mostrar en la UI de éxito
    setGeneratedBytesHex(
      dataToWrite
        .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
        .join(" "),
    );

    try {
      setStatus("PROCESSING");

      // 1. Solicitar Tecnología MifareClassic
      await NfcManager.requestTechnology(NfcTech.MifareClassic);

      // 2. Autenticar Sector 9 con Key B
      // Sector 9 controla los bloques 36, 37, 38 y 39
      const keyBBytes = hexStringToHexArray(KEY_B);
      await NfcManager.mifareClassicHandlerAndroid.mifareClassicAuthenticateB(
        9,
        keyBBytes,
      );

      // 3. Escritura en bloques redundantes (37 y 38)
      await NfcManager.mifareClassicHandlerAndroid.mifareClassicWriteBlock(
        37,
        dataToWrite,
      );
      await NfcManager.mifareClassicHandlerAndroid.mifareClassicWriteBlock(
        38,
        dataToWrite,
      );

      setStatus("SUCCESS");
    } catch (ex) {
      console.warn(ex);
      Alert.alert(
        "Error de Inyección",
        "No se pudo escribir en la tarjeta. Asegúrate de mantenerla pegada al dispositivo.",
      );
      setStatus("IDLE");
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => 0);
    }
    NfcManager.cancelTechnologyRequest().catch(() => 0);
  };

  const resetForm = () => {
    setStatus("IDLE");
    setCustomAmount("15.00");
  };

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>‹ REGRESAR A CLÚSTER</Text>
        </TouchableOpacity>
        <Text style={styles.mainTitle}>RECARGAR SALDO</Text>
        <Text style={styles.subTitle}>
          Inyector de datos redundantes en Bloques 37/38 vía Key B.
        </Text>
      </View>

      {status === "IDLE" || status === "PROCESSING" ? (
        <View style={styles.body}>
          <View style={styles.cardBox}>
            <Text style={styles.sectionTitle}>
              &gt; [01] DEFINIR CANTIDAD A INYECTAR
            </Text>

            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  isUsingCustom && styles.toggleBtnActive,
                ]}
                onPress={() => setIsUsingCustom(true)}
                disabled={status === "PROCESSING"}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    isUsingCustom && styles.toggleBtnTextActive,
                  ]}
                >
                  Monto Libre
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  !isUsingCustom && styles.toggleBtnActive,
                ]}
                onPress={() => {
                  setIsUsingCustom(false);
                  setCustomAmount(selectedPack.price);
                }}
                disabled={status === "PROCESSING"}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    !isUsingCustom && styles.toggleBtnTextActive,
                  ]}
                >
                  Planes Carga
                </Text>
              </TouchableOpacity>
            </View>

            {isUsingCustom ? (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>
                  &gt; INTRODUCIR SALDO (EUR €):
                </Text>
                <TextInput
                  style={styles.numericInput}
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  keyboardType="numeric"
                  placeholder="25.00"
                  editable={status !== "PROCESSING"}
                  placeholderTextColor="rgba(255, 85, 0, 0.2)"
                />
              </View>
            ) : (
              <View style={styles.packagesGrid}>
                {RECHARGE_PACKAGES.map((pack) => (
                  <TouchableOpacity
                    key={pack.id}
                    style={[
                      styles.packageCard,
                      selectedPack.id === pack.id && styles.packageCardActive,
                    ]}
                    onPress={() => {
                      setSelectedPack(pack);
                      setCustomAmount(pack.price);
                    }}
                    disabled={status === "PROCESSING"}
                  >
                    <Text style={styles.packagePrice}>{pack.price} €</Text>
                    <Text style={styles.packageBonus}>{pack.bonus}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.actionBtn,
                status === "PROCESSING" && styles.actionBtnDisabled,
              ]}
              onPress={handleInyeccion}
              disabled={status === "PROCESSING"}
              activeOpacity={0.8}
            >
              {status === "PROCESSING" ? (
                <ActivityIndicator color="#ff5500" />
              ) : (
                <Text style={styles.actionBtnText}>EJECUTAR INYECCIÓN NFC</Text>
              )}
            </TouchableOpacity>
          </View>

          {status === "PROCESSING" && (
            <Text style={styles.scanningText}>
              APROXIME LA TARJETA AL LECTOR...
            </Text>
          )}

          <View style={styles.diagnosticsBox}>
            <Text style={styles.diagTitle}>PROTOCOLO SECTOR 09 SECURITY</Text>
            <Text style={styles.diagPoint}>
              • Genera un checksum hexadecimal de 16 bytes que valida balances
              redundantes.
            </Text>
            <Text style={styles.diagPoint}>
              • Los bytes [4-7] son invertidos bit a bit (~b) para evitar
              corrupciones físicas.
            </Text>
            <View style={styles.diagBadge}>
              <Text style={styles.diagBadgeTxt}>WRITE_KEY_B: {KEY_B}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successHeader}>PAYLOAD INYECTADO</Text>
          <Text style={styles.successSubHeader}>
            LOS PROTOCOLOS NFC SE HAN EJECUTADO CON ÉXITO
          </Text>

          <View style={styles.hexBlobBox}>
            <Text style={styles.hexBlobLabel}>
              VOLCADO HEXADECIMAL ESCRITO:
            </Text>
            <Text style={styles.hexBlobValue}>{generatedBytesHex}</Text>
            <View style={styles.divider} />
            <Text style={styles.hexBlobDesc}>
              • Bloques afectados: 37, 38 (Sector 09).
            </Text>
            <Text style={styles.hexBlobDesc}>• Auth: Key B verificada.</Text>
          </View>

          <View style={styles.successButtonsRow}>
            <TouchableOpacity style={styles.backToFormBtn} onPress={resetForm}>
              <Text style={styles.backToFormBtnText}>NUEVA CARGA</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backToLauncherBtn} onPress={onBack}>
              <Text style={styles.backToLauncherBtnText}>IR AL INICIO</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ... Se mantienen los estilos de Recarga.tsx ...
  scrollContainer: { flex: 1, backgroundColor: "#020203" },
  contentContainer: { padding: 16, paddingBottom: 40 },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 85, 0, 0.2)",
    paddingBottom: 16,
    marginBottom: 20,
    marginTop: 10,
  },
  backBtn: { marginBottom: 10 },
  backBtnText: {
    color: "#ff5500",
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "bold",
  },
  mainTitle: { color: "#ffffff", fontSize: 24, fontWeight: "bold" },
  subTitle: {
    color: "rgba(255, 85, 0, 0.6)",
    fontFamily: "monospace",
    fontSize: 10,
    marginTop: 4,
  },
  body: { gap: 20 },
  cardBox: {
    borderWidth: 1.5,
    borderColor: "rgba(255, 85, 0, 0.25)",
    backgroundColor: "#070709",
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    color: "#ff6a1a",
    fontSize: 10,
    fontFamily: "monospace",
    marginBottom: 14,
  },
  toggleRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 85, 0, 0.15)",
  },
  toggleBtnActive: {
    borderColor: "#ff5500",
    backgroundColor: "rgba(255, 85, 0, 0.08)",
  },
  toggleBtnText: { color: "#94a3b8", fontFamily: "monospace", fontSize: 10 },
  toggleBtnTextActive: { color: "#ffffff" },
  inputWrapper: { marginBottom: 16 },
  inputLabel: {
    color: "#ff5500",
    fontFamily: "monospace",
    fontSize: 9,
    marginBottom: 8,
  },
  numericInput: {
    borderWidth: 1,
    borderColor: "rgba(255, 85, 0, 0.2)",
    backgroundColor: "#020203",
    borderRadius: 8,
    color: "#ffffff",
    fontSize: 24,
    textAlign: "center",
    paddingVertical: 12,
    fontFamily: "monospace",
  },
  packagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  packageCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "rgba(255, 85, 0, 0.15)",
    borderRadius: 8,
    padding: 10,
  },
  packageCardActive: {
    borderColor: "#ff5500",
    backgroundColor: "rgba(255, 85, 0, 0.06)",
  },
  packagePrice: { color: "#ffffff", fontSize: 14, fontWeight: "bold" },
  packageBonus: { color: "#a1a1aa", fontSize: 8 },
  actionBtn: {
    backgroundColor: "rgba(255, 85, 0, 0.1)",
    borderWidth: 1.5,
    borderColor: "#ff5500",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: {
    color: "#ff5500",
    fontWeight: "bold",
    fontSize: 11,
    fontFamily: "monospace",
  },
  scanningText: {
    color: "#ff5500",
    textAlign: "center",
    fontFamily: "monospace",
    fontSize: 12,
    animate: "blink",
  },
  diagnosticsBox: {
    borderWidth: 1.5,
    borderColor: "rgba(255, 85, 0, 0.15)",
    borderRadius: 12,
    padding: 16,
  },
  diagTitle: {
    color: "#ffffff",
    fontSize: 10,
    fontFamily: "monospace",
    marginBottom: 8,
  },
  diagPoint: {
    color: "#94a3b8",
    fontSize: 9,
    fontFamily: "monospace",
    marginBottom: 6,
  },
  diagBadge: {
    backgroundColor: "#000000",
    padding: 6,
    borderRadius: 4,
    marginTop: 8,
  },
  diagBadgeTxt: {
    color: "rgba(255, 85, 0, 0.6)",
    fontFamily: "monospace",
    fontSize: 8,
    textAlign: "center",
  },
  successContainer: {
    borderWidth: 2,
    borderColor: "#ff5500",
    backgroundColor: "#070709",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  successIcon: { fontSize: 40, color: "#00ff41", marginBottom: 12 },
  successHeader: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
  successSubHeader: {
    color: "#00ff41",
    fontFamily: "monospace",
    fontSize: 8,
    marginBottom: 20,
  },
  hexBlobBox: {
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "rgba(255, 85, 0, 0.2)",
    borderRadius: 8,
    padding: 14,
    width: "100%",
    marginBottom: 20,
  },
  hexBlobLabel: {
    color: "#ffffff",
    fontFamily: "monospace",
    fontSize: 8,
    marginBottom: 6,
  },
  hexBlobValue: {
    color: "#00ff41",
    fontFamily: "monospace",
    fontSize: 12,
    textAlign: "center",
    marginVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 85, 0, 0.15)",
    marginVertical: 10,
  },
  hexBlobDesc: { color: "#8e9cae", fontSize: 8, fontFamily: "monospace" },
  successButtonsRow: { flexDirection: "row", gap: 10, width: "100%" },
  backToFormBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 85, 0, 0.5)",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  backToFormBtnText: { color: "#ff5500", fontFamily: "monospace", fontSize: 9 },
  backToLauncherBtn: {
    flex: 1,
    backgroundColor: "#ff5500",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  backToLauncherBtnText: {
    color: "#000000",
    fontFamily: "monospace",
    fontSize: 9,
    fontWeight: "bold",
  },
});
