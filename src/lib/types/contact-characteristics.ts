export interface ContactCharacteristicConfig {
  id: string;
  name: string;
  created_at: string;
}

export interface ContactCharacteristics {
  [key: string]: boolean;
}

export interface ContactCharacteristicFormData {
  name: string;
}
