import ExpoModulesCore
import Speech

// Whether the speech recogniser for one locale (ar-SA) runs on this device. expo-speech-recognition only reports this
// for the device's default locale and quietly falls back to Apple's servers when the requested locale has no
// on-device model; the blind recitation promises "on this device", so it asks here first.
public final class QmcSpeechCheckModule: Module {
  public func definition() -> ModuleDefinition {
    Name("QmcSpeechCheck")

    Function("supportsOnDevice") { (locale: String) -> Bool in
      guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: locale)) else { return false }
      return recognizer.supportsOnDeviceRecognition
    }
  }
}
