import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  type EmitterSubscription,
} from "react-native";

type HumeMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type NativeHumeBridge = {
  addListener: (eventName: string) => void;
  connect: (
    apiKey: string,
    configId: string,
    systemPrompt: string,
    variables: Record<string, string>
  ) => Promise<void>;
  disconnect: () => void;
  removeListeners: (count: number) => void;
  setMuted: (muted: boolean) => void;
};

const getNativeBridge = (): NativeHumeBridge => {
  if (Platform.OS !== "ios") {
    throw new Error("Hume voice is currently only available in the iOS development build.");
  }

  const bridge = NativeModules.HumeBridge as NativeHumeBridge | undefined;
  if (!bridge) {
    throw new Error("Hume native bridge is unavailable. Rebuild the iOS development app.");
  }

  return bridge;
};

export class HumeVoiceService {
  private bridge?: NativeHumeBridge;
  private messageSubscription?: EmitterSubscription;
  private statusSubscription?: EmitterSubscription;
  private volumeSubscription?: EmitterSubscription;

  constructor(private config: { apiKey: string; configId: string }) {}

  async connect(
    sessionSettings: {
      systemPrompt: string;
      variables?: Record<string, string>;
    },
    onMessage: (msg: HumeMessage) => void,
    onStatusChange: (status: string, message?: string) => void,
    onVolume: (val: number) => void
  ) {
    const apiKey = this.config.apiKey.trim();
    const configId = this.config.configId.trim();

    if (!apiKey || !configId) {
      throw new Error("Missing Hume API key or config ID.");
    }

    const bridge = getNativeBridge();
    const humeEventEmitter = new NativeEventEmitter(bridge);
    this.bridge = bridge;

    this.messageSubscription = humeEventEmitter.addListener(
      "onMessage",
      onMessage
    );
    this.statusSubscription = humeEventEmitter.addListener(
      "onStatusChange",
      (data) => onStatusChange(data.status, data.message)
    );
    this.volumeSubscription = humeEventEmitter.addListener(
      "onVolumeLevel",
      (data) => onVolume(data.value)
    );

    await bridge.connect(
      apiKey,
      configId,
      sessionSettings.systemPrompt,
      sessionSettings.variables ?? {}
    );
  }

  disconnect() {
    this.bridge?.disconnect();
    this.messageSubscription?.remove();
    this.statusSubscription?.remove();
    this.volumeSubscription?.remove();
    this.messageSubscription = undefined;
    this.statusSubscription = undefined;
    this.volumeSubscription = undefined;
    this.bridge = undefined;
  }

  setMuted(muted: boolean) {
    this.bridge?.setMuted(muted);
  }
}
