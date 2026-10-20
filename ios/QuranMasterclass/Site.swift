import Foundation

/// The website the app shows. Everything on quranmasterclass.com opens inside the app, everything else in Safari.
enum Site {
    static let host = "quranmasterclass.com"
    static let home = URL(string: "https://quranmasterclass.com/")!

    static func isOwn(_ url: URL?) -> Bool { isOwnHost(url?.host) }
    static func isOwnHost(_ host: String?) -> Bool {
        guard let h = host?.lowercased() else { return false }
        return h == Site.host || h == "www." + Site.host
    }

    /// quranmasterclass://surah/1?shams=1  →  https://quranmasterclass.com/surah/1?shams=1
    static func url(fromScheme url: URL) -> URL? {
        guard url.scheme?.lowercased() == "quranmasterclass" else { return nil }
        var c = URLComponents()
        c.scheme = "https"
        c.host = Site.host
        let path = (url.host.map { "/" + $0 } ?? "") + url.path
        c.path = path.isEmpty ? "/" : path
        c.query = url.query
        return c.url
    }

    /// The page the learner had open last time, so the app continues where they stopped
    static var lastPage: URL? {
        get { UserDefaults.standard.url(forKey: "lastPage").flatMap { isOwn($0) ? $0 : nil } }
        set { UserDefaults.standard.set(newValue, forKey: "lastPage") }
    }
}

extension Bundle {
    var appVersion: String { infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0" }
}
