import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
// import { useRouter } from 'expo-router'; // Descomenta si realmente necesitas navegar

const KEYS_A = [
  "63C88F562B97",
  "1848A8D1E4C5",
  "16EE1FE134E4",
  "5246B8F4ACFC",
  "515A8209843C",
  "0EF7636AA829",
  "E59D0F78C413",
  "5AF68604DD6B",
  "B0BCB22DCBA3",
  "51B3EF60BF56",
  "99100225D83B",
  "63C88F562B97",
  "B30B6A5AD434",
  "D33E4A4A0041",
  "9C0A4CC89D61",
  "5204D83D8CD3",
  "A662F9DC0D3D",
  "000000000000",
  "41534E354936",
  "454D41343253",
  "4541444C4130",
  "46305234324E",
  "505444505232",
  "5239425A3546",
  "454449434631",
  "414F4544384C",
  "344E4F4E4937",
  "45444E413254",
  "3255534D3033",
  "4F554D523935",
  "3141544D3735",
  "494E47463539",
  "32414F4E3341",
  "41534C473637",
  "534E41395430",
  "41364C38364F",
  "525241414D39",
  "41304532334F",
  "4D4545494F35",
  "4E324C453045",
  "394143494E32",
  "5352554E3245",
  "324553553036",
  "444D414E3539",
  "324745413232",
  "4E4E41455236",
  "394C52493639",
  "4D4941413236",
  "414D504F3243",
  "434C414E3639",
];

let KEY_A_SELECTED = "";
let saldo_selected = "";
let hex_dump = "";
let UID = "";

interface SaldoProps {
  onBack: () => void;
}

// Tipo de dato para los volcados
interface DumpData {
  name: string;
  hex: string;
}

export default function Saldo({ onBack }: SaldoProps) {
  // Ahora presetDumps es la fuente de verdad, inicia vacío o con tarjetas predefinidas.
  const [presetDumps, setPresetDumps] = useState<DumpData[]>([]);

  // Estados unificados
  const [status, setStatus] = useState<
    "WAITING" | "PROCESSING" | "SUCCESS" | "ERROR"
  >("WAITING");

  const [selectedHexDump, setSelectedHexDump] = useState("");
  const [customHexInput, setCustomHexInput] = useState("");
  const [decodedBalance, setDecodedBalance] = useState<number>(0.0);
  const [dataRead, setDataRead] = useState("");

  // const router = useRouter();

  useEffect(() => {
    readNfcTag();
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  const procesarSaldo = (dataString: string): number => {
    try {
      const cleanStr = dataString.replace(/[^A-Fa-f0-9\s]/g, "").trim();
      const dataArray = cleanStr.split(/\s+/).map((hex) => parseInt(hex, 16));

      if (dataArray.length < 4 || dataArray.some(isNaN)) {
        return 0;
      }

      const primerosCuatro = dataArray.slice(0, 4);
      const littleEndianBytes = [...primerosCuatro].reverse();
      const hexString = littleEndianBytes
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const valorEntero = parseInt(hexString, 16);
      const saldoMitad = valorEntero / 2;
      return Math.trunc(saldoMitad) / 100;
    } catch {
      return 0;
    }
  };

  const hexStringToHexArray = (hexString: string) => {
    const bytes = [];
    for (let i = 0; i < hexString.length; i += 2) {
      bytes.push(parseInt(hexString.substring(i, i + 2), 16));
    }
    return bytes;
  };

  const readNfcTag = async () => {
    try {
      setStatus("WAITING");
      await NfcManager.start();
      await NfcManager.requestTechnology(NfcTech.MifareClassic);
      setStatus("PROCESSING");

      const sector = 9;
      const block = 37;
      let authenticated = false;

      for (const keyHex of KEYS_A) {
        try {
          const keyArray = hexStringToHexArray(keyHex);
          const mifare = NfcManager.mifareClassicHandlerAndroid;
          await mifare.mifareClassicAuthenticateA(sector, keyArray);
          KEY_A_SELECTED = Array.from(keyArray)
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase();
          const tag = await NfcManager.getTag();
          UID = tag?.id?.toString() || "DESC";
          authenticated = true;
          break;
        } catch (authError) {
          continue;
        }
      }

      if (!authenticated) {
        throw new Error(
          "AUTH_FAILED: Ninguna clave del diccionario es válida para este sector.",
        );
      }

      const response =
        await NfcManager.mifareClassicHandlerAndroid.mifareClassicReadBlock(
          block,
        );

      const hexData = response
        .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
        .join(" ");

      hex_dump = hexData;

      const balanceFinal = procesarSaldo(hexData);
      setDecodedBalance(balanceFinal);
      setDataRead(balanceFinal.toString());
      setStatus("SUCCESS");

      // Si se lee por NFC, lo añadimos al estado automáticamente (opcional)
      setPresetDumps((prev) => [
        ...prev,
        {
          name: `NFC - UID: ${UID} (Saldo ${balanceFinal} €)`,
          hex: hex_dump,
        },
      ]);
    } catch (ex: any) {
      console.warn(ex);
      setStatus("ERROR");
      setDataRead(ex.message || "UNKNOWN_ERROR");
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  const startScan = () => {
    const hex = customHexInput || selectedHexDump;
    if (hex) {
      const balance = procesarSaldo(hex);
      saldo_selected = balance.toString();

      // ACTUALIZAMOS EL ESTADO DE FORMA DINÁMICA
      const newDump: DumpData = {
        name: customHexInput
          ? `Ingreso Manual: Saldo ${saldo_selected} €`
          : `Tarjeta ${UID || "Cache"}: Saldo ${saldo_selected} €`,
        hex: hex,
      };

      // Si es un ingreso manual, lo añadimos a la lista para no perderlo
      if (customHexInput) {
        setPresetDumps((prevDumps) => [...prevDumps, newDump]);
        setSelectedHexDump(hex);
        setCustomHexInput(""); // Limpiamos el input después de añadirlo
      }

      setDecodedBalance(balance);
      setStatus("SUCCESS");
    }
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
        <Text style={styles.mainTitle}>EXTRACCIÓN DE SALDO NFC</Text>
        <Text style={styles.subTitle}>
          Auditoría y decodificación del bloque 37 (Sector 09).
        </Text>
      </View>

      <View style={styles.layoutGrid}>
        <View style={styles.cardBox}>
          <Text style={styles.sectionTitle}>
            &gt; DESCARGAR Y PROBAR TARJETA:
          </Text>

          <View style={styles.dumpList}>
            {presetDumps.length > 0 ? (
              presetDumps.map((dump, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.dumpCard,
                    selectedHexDump === dump.hex &&
                      !customHexInput &&
                      styles.dumpCardActive,
                  ]}
                  onPress={() => {
                    setSelectedHexDump(dump.hex);
                    setCustomHexInput("");
                    setStatus("WAITING");
                  }}
                >
                  <Text style={styles.dumpName}>{dump.name}</Text>
                  <Text style={styles.dumpHex} numberOfLines={1}>
                    {dump.hex}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ color: "#8e9cae", fontSize: 10 }}>
                No hay volcados en el historial aún.
              </Text>
            )}
          </View>

          <View style={styles.customInputBox}>
            <Text style={styles.label}>
              O introduce un volcado manual (Hex):
            </Text>
            <TextInput
              style={styles.textInput}
              value={customHexInput}
              onChangeText={(txt) => {
                setCustomHexInput(txt);
                setStatus("WAITING");
              }}
              placeholder="Ej: C8 27 00 00 ..."
              placeholderTextColor="rgba(255, 85, 0, 0.2)"
            />
          </View>

          {status === "WAITING" && (
            <TouchableOpacity style={styles.mainActionBtn} onPress={startScan}>
              <Text style={styles.mainActionBtnTxt}>ANALIZAR Y LEER CORES</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.sectionTitle}>&gt; CONSOLA DE AUDITORÍA:</Text>

          {status === "WAITING" || status === "PROCESSING" ? (
            <View style={styles.waitingContent}>
              <Text style={styles.statusBlink}>
                {status === "PROCESSING"
                  ? "[!] LEYENDO DISPOSITIVO..."
                  : "[!] ESPERANDO DISPOSITIVO NFC..."}
              </Text>
              <Text style={styles.waitingText}>
                Selecciona una tarjeta o ingresa sus bloques hexadecimales y
                pulsa el botón "Analizar".
              </Text>
            </View>
          ) : status === "ERROR" ? (
            <View style={styles.waitingContent}>
              <Text style={[styles.statusBlink, { color: "red" }]}>
                [X] ERROR DE LECTURA
              </Text>
              <Text style={styles.waitingText}>{dataRead}</Text>
              <TouchableOpacity
                style={[styles.secondaryActionBtn, { marginTop: 15 }]}
                onPress={() => {
                  setStatus("WAITING");
                  readNfcTag();
                }}
              >
                <Text style={styles.secondaryActionBtnTxt}>REINTENTAR</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.successContent}>
              <View style={styles.successBadge}>
                <Text style={styles.successBadgeTitle}>
                  ¡SECTOR 9 AUTENTICADO CON ÉXITO!
                </Text>
                <Text style={styles.successBadgeKey}>KEY A: {UID}</Text>
              </View>

              <Text style={styles.resultLabel}>SALDO DETECTADO</Text>
              <Text style={styles.balanceText}>
                {decodedBalance.toFixed(2)} €
              </Text>

              <View style={styles.traceContainer}>
                <Text style={styles.traceHeader}>MÉTODO DE DESCOMPRESIÓN:</Text>
                <Text style={styles.traceText}>
                  • HEX DUMP:{" "}
                  {customHexInput || selectedHexDump || "LEÍDO POR NFC"}
                </Text>
                <Text style={styles.traceText}>
                  • COMPUTED COMPRESSED KEY A: {KEY_A_SELECTED}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={() => {
                  setStatus("WAITING");
                  readNfcTag();
                }}
              >
                <Text style={styles.secondaryActionBtnTxt}>
                  VOLVER A ESCANEAR
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ... Los estilos de tu código anterior se mantienen igual
  scrollContainer: {
    flex: 1,
    backgroundColor: "#020203",
    width: "100%",
    height: Dimensions.get("window").height,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 85, 0, 0.2)",
    paddingBottom: 16,
    marginBottom: 20,
    marginTop: 10,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  backBtnText: {
    color: "#ff5500",
    fontFamily: "monospace",
    fontSize: 10,
    fontWeight: "bold",
  },
  mainTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  subTitle: {
    color: "rgba(255, 85, 0, 0.6)",
    fontFamily: "monospace",
    fontSize: 10,
    marginTop: 4,
    lineHeight: 14,
  },
  layoutGrid: {
    gap: 20,
  },
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
    fontWeight: "bold",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  dumpList: {
    gap: 10,
    marginBottom: 14,
  },
  dumpCard: {
    borderWidth: 1,
    borderColor: "rgba(255, 85, 0, 0.15)",
    backgroundColor: "#000000",
    borderRadius: 8,
    padding: 10,
  },
  dumpCardActive: {
    borderColor: "#ff5500",
    backgroundColor: "rgba(255, 85, 0, 0.08)",
  },
  dumpName: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  dumpHex: {
    color: "#8e9cae",
    fontSize: 8,
    fontFamily: "monospace",
    marginTop: 2,
  },
  customInputBox: {
    marginBottom: 16,
  },
  label: {
    color: "#ff6a1a",
    fontSize: 8,
    fontFamily: "monospace",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "rgba(255, 85, 0, 0.25)",
    backgroundColor: "#020203",
    borderRadius: 6,
    color: "#ffffff",
    fontSize: 11,
    fontFamily: "monospace",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mainActionBtn: {
    backgroundColor: "rgba(255, 85, 0, 0.1)",
    borderWidth: 1.5,
    borderColor: "#ff5500",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  mainActionBtnTxt: {
    color: "#ff5500",
    fontWeight: "bold",
    fontSize: 11,
    fontFamily: "monospace",
  },
  resultBox: {
    borderWidth: 1.5,
    borderColor: "rgba(255, 85, 0, 0.15)",
    backgroundColor: "rgba(7, 7, 9, 0.4)",
    borderRadius: 12,
    padding: 16,
    minHeight: 200,
  },
  waitingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  statusBlink: {
    color: "#ffbb00",
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "monospace",
    textAlign: "center",
    marginBottom: 8,
  },
  waitingText: {
    color: "#64748b",
    fontSize: 9,
    textAlign: "center",
    lineHeight: 14,
    maxWidth: 240,
  },
  successContent: {
    alignItems: "center",
  },
  successBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "#10b981",
    borderRadius: 8,
    padding: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  successBadgeTitle: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  successBadgeKey: {
    color: "#10b981",
    fontFamily: "monospace",
    fontSize: 8,
    marginTop: 2,
  },
  resultLabel: {
    color: "rgba(255, 85, 0, 0.6)",
    fontFamily: "monospace",
    fontSize: 9,
    fontWeight: "bold",
  },
  balanceText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#ffffff",
    marginVertical: 10,
  },
  traceContainer: {
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "rgba(255, 85, 0, 0.15)",
    borderRadius: 8,
    padding: 10,
    width: "100%",
    marginBottom: 16,
  },
  traceHeader: {
    color: "#ffffff",
    fontFamily: "monospace",
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 4,
  },
  traceText: {
    color: "#8e9cae",
    fontSize: 8,
    fontFamily: "monospace",
    lineHeight: 12,
  },
  secondaryActionBtn: {
    borderColor: "rgba(255, 85, 0, 0.4)",
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    width: "100%",
  },
  secondaryActionBtnTxt: {
    color: "#ff5500",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "bold",
  },
});
