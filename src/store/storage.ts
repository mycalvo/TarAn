/**
 * 
 * @brief Biblioteca de almacenamiento local de datos
 * @author Sergio Cubero León
 * @version 1.0
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const DB_KEY = "@nfc_cards_db";

export interface CardNode {
  uid: string;
  alias: string;
  notes: string;
}

export const getCards = async (): Promise<CardNode[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(DB_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Error reading DB", e);
    return [];
  }
};

export const saveCard = async (newCard: CardNode): Promise<void> => {
  try {
    const currentCards = await getCards();
    // Evitar duplicados por UID
    const filtered = currentCards.filter((c) => c.uid !== newCard.uid);
    const updatedCards = [...filtered, newCard];
    await AsyncStorage.setItem(DB_KEY, JSON.stringify(updatedCards));
  } catch (e) {
    console.error("Error writing DB", e);
  }
};