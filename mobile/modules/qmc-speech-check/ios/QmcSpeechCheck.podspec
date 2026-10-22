Pod::Spec.new do |s|
  s.name           = 'QmcSpeechCheck'
  s.version        = '1.0.0'
  s.summary        = 'Whether speech recognition for a locale runs on the device'
  s.description    = 'Quran Masterclass: checks on-device Arabic recognition before a blind recitation take'
  s.license        = 'MIT'
  s.author         = 'Quran Masterclass'
  s.homepage       = 'https://quranmasterclass.com'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks     = 'Speech'
  s.source_files = "**/*.{h,m,swift}"
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES', 'SWIFT_COMPILATION_MODE' => 'wholemodule' }
end
