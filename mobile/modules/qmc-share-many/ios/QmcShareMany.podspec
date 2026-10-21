Pod::Spec.new do |s|
  s.name           = 'QmcShareMany'
  s.version        = '1.0.0'
  s.summary        = 'Shares several files in one system share sheet'
  s.description    = 'Quran Masterclass: shares all slides of a carousel together (Instagram carousel post)'
  s.license        = 'MIT'
  s.author         = 'Quran Masterclass'
  s.homepage       = 'https://quranmasterclass.com'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = "**/*.{h,m,swift}"
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES', 'SWIFT_COMPILATION_MODE' => 'wholemodule' }
end
