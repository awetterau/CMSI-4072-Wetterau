import Foundation
import Hume
import React
import Combine
import AVFoundation
import CoreBluetooth // Added for Bluetooth permission trigger

@objc(HumeBridge)
class HumeBridge: RCTEventEmitter, VoiceProviderDelegate, CBCentralManagerDelegate {
    private var humeClient: HumeClient?
    private var voiceProvider: VoiceProvider?
    private var currentStatus: String = "disconnected"
    private var hasListeners = false
    private var cbManager: CBCentralManager? // Used to trigger Bluetooth prompt

    override func supportedEvents() -> [String]! {
        return ["onMessage", "onStatusChange", "onVolumeLevel"]
    }

    override func startObserving() { hasListeners = true }
    override func stopObserving() { hasListeners = false }

    private func safeSendEvent(name: String, body: Any) {
        if hasListeners { sendEvent(withName: name, body: body) }
    }

    @objc(connect:configId:systemPrompt:variables:resolver:rejecter:)
    func connect(
        apiKey: String,
        configId: String,
        systemPrompt: String,
        variables: NSDictionary,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        // 1. Trigger Bluetooth Permission Prompt
        if cbManager == nil {
            cbManager = CBCentralManager(delegate: self, queue: nil)
        }

        // 2. Audio Session Configuration
        do {
            let audioSession = AVAudioSession.sharedInstance()
            try audioSession.setCategory(.playAndRecord, mode: .voiceChat, options: [.allowBluetooth, .defaultToSpeaker])
            try audioSession.setActive(true)
        } catch {
            print("HumeBridge: Audio Error: \(error)")
        }

        if currentStatus == "connected" || currentStatus == "connecting" {
            resolver(NSNull())
            return
        }

        humeClient = HumeClient(options: .apiKey(key: apiKey))
        guard let client = humeClient else {
            rejecter("no_client", "Failed to create Hume client", nil)
            return
        }

        voiceProvider = VoiceProviderFactory.shared.getVoiceProvider(client: client)
        voiceProvider?.delegate = self
        voiceProvider?.isInputMeteringEnabled = true
        currentStatus = "connecting"

        Task {
            do {
                let settings = SessionSettings(
                    audio: nil,
                    builtinTools: nil,
                    context: nil,
                    customSessionId: nil,
                    languageModelApiKey: nil,
                    systemPrompt: systemPrompt,
                    tools: nil,
                    variables: variables as? [String: String],
                    voiceId: nil
                )
              try await voiceProvider?.connect(
                  configId: configId,
                  configVersion: nil,          // Required
                  resumedChatGroupId: nil,     // Required
                  sessionSettings: settings
              )
              resolver(NSNull())
            } catch {
                currentStatus = "disconnected"
                safeSendEvent(name: "onStatusChange", body: ["status": "error", "message": error.localizedDescription])
                rejecter("connect_error", "\(error.localizedDescription)", error)
            }
        }
    }

    // Bluetooth Delegate Requirement (can be empty)
    func centralManagerDidUpdateState(_ central: CBCentralManager) {}

    // 3. Audio Metering (The "Pulsing" Data)
  func voiceProvider(_ provider: any VoiceProvidable, didReceieveAudioInputMeter meter: Float) {
      // meter is usually -160 (silent) to 0 (loud)
      // This formula ensures the orb stays at 1.0 scale when silent
      // and jumps up to ~1.5 when you are loud.
      let normalized = max(1.0, (meter + 50) / 30 + 1.0)
      safeSendEvent(name: "onVolumeLevel", body: ["value": normalized])
  }

    // MARK: - Event Handling (The Transcript Data)
    func voiceProvider(_ provider: any VoiceProvidable, didProduceEvent event: SubscribeEvent) {
        switch event {
        case .assistantMessage(let message):
            safeSendEvent(name: "onMessage", body: [
                "role": "assistant",
                "content": message.message.content,
                "timestamp": Date().timeIntervalSince1970
            ])
            safeSendEvent(name: "onStatusChange", body: ["status": "speaking"])
        case .userInterruption:
            safeSendEvent(name: "onStatusChange", body: ["status": "listening"])
        case .userMessage(let message):
            safeSendEvent(name: "onMessage", body: [
                "role": "user",
                "content": message.message.content,
                "timestamp": Date().timeIntervalSince1970
            ])
            safeSendEvent(name: "onStatusChange", body: ["status": "listening"])
        default: break
        }
    }

    func voiceProvider(_ provider: any VoiceProvidable, didProduceError error: VoiceProviderError) {
        safeSendEvent(name: "onStatusChange", body: ["status": "error", "message": "\(error)"])
    }
    
    @objc(disconnect)
    func disconnect() {
        Task {
            await voiceProvider?.disconnect()
            currentStatus = "disconnected"
            safeSendEvent(name: "onStatusChange", body: ["status": "disconnected"])
        }
    }

    @objc(setMuted:)
    func setMuted(_ muted: Bool) {
        voiceProvider?.mute(muted)
    }

    func voiceProviderDidConnect(_ provider: any VoiceProvidable) {
        currentStatus = "connected"
        safeSendEvent(name: "onStatusChange", body: ["status": "connected"])
    }

    func voiceProviderDidDisconnect(_ provider: any VoiceProvidable) {
        currentStatus = "disconnected"
        safeSendEvent(name: "onStatusChange", body: ["status": "disconnected"])
    }

    @objc override static func requiresMainQueueSetup() -> Bool { return true }
}
