import UIKit
import WebKit
import SafariServices

/// The whole Masterclass in a native shell: full screen, recitation in the background, pull to refresh,
/// a calm offline screen, and a small bridge (window.QMCApp) for In-App Purchases.
final class WebViewController: UIViewController {
    static let brand = UIColor(red: 8 / 255, green: 38 / 255, blue: 29 / 255, alpha: 1)   // #08261D
    static let gold = UIColor(red: 201 / 255, green: 166 / 255, blue: 94 / 255, alpha: 1)  // #C9A65E

    private let start: URL
    private var webView: WKWebView!
    private let progress = UIProgressView(progressViewStyle: .bar)
    private let refresh = UIRefreshControl()
    private let offline = OfflineView()
    private var observations: [NSKeyValueObservation] = []

    init(start: URL) {
        self.start = start
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override var preferredStatusBarStyle: UIStatusBarStyle { .lightContent }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = Self.brand

        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.allowsAirPlayForMediaPlayback = true
        config.allowsPictureInPictureMediaPlayback = true
        config.websiteDataStore = .default()
        // the website recognises the app (hides "install the app" hints, shows Premium)
        config.applicationNameForUserAgent = "Version/17.0 Mobile/15E148 Safari/604.1 QuranMasterclassApp/\(Bundle.main.appVersion) (iOS)"
        config.userContentController.add(WeakMessageHandler(self), name: "qmc")

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.allowsLinkPreview = true
        webView.isOpaque = false
        webView.backgroundColor = Self.brand
        webView.scrollView.backgroundColor = Self.brand
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)

        refresh.tintColor = Self.gold
        refresh.addTarget(self, action: #selector(reloadPage), for: .valueChanged)
        webView.scrollView.refreshControl = refresh

        progress.progressTintColor = Self.gold
        progress.trackTintColor = .clear
        progress.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(progress)

        offline.isHidden = true
        offline.onRetry = { [weak self] in self?.retry() }
        offline.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(offline)

        let safe = view.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            // below the status bar; down to the very bottom (the page leaves room for the home indicator itself)
            webView.topAnchor.constraint(equalTo: safe.topAnchor),
            webView.leadingAnchor.constraint(equalTo: safe.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: safe.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            progress.topAnchor.constraint(equalTo: safe.topAnchor),
            progress.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            progress.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            progress.heightAnchor.constraint(equalToConstant: 2),
            offline.topAnchor.constraint(equalTo: view.topAnchor),
            offline.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            offline.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            offline.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])

        observations.append(webView.observe(\.estimatedProgress, options: [.new]) { [weak self] wv, _ in
            guard let self else { return }
            self.progress.setProgress(Float(wv.estimatedProgress), animated: true)
            self.progress.isHidden = wv.estimatedProgress >= 1
        })

        installScripts()
        Store.shared.onChange = { [weak self] in self?.storeChanged() }
        webView.load(URLRequest(url: start))
    }

    // MARK: - public

    func open(_ url: URL) {
        offline.isHidden = true
        webView.load(URLRequest(url: url))
    }

    func rememberPage() {
        if let url = webView?.url, Site.isOwn(url) { Site.lastPage = url }
    }

    // MARK: - page scripts

    /// viewport-fit=cover lets the page's env(safe-area-inset-bottom) keep the tab bar above the home indicator
    private static let viewportJS = """
    (function(){var m=document.querySelector('meta[name=viewport]');
    if(m){if(m.content.indexOf('viewport-fit')<0)m.content=m.content+', viewport-fit=cover';}
    else{m=document.createElement('meta');m.name='viewport';m.content='width=device-width, initial-scale=1, viewport-fit=cover';document.head.appendChild(m);}
    document.documentElement.classList.add('qmc-ios-app');})();
    """

    private func stateJS() -> String {
        let s = Store.shared
        let state: [String: Any] = [
            "platform": "ios",
            "version": Bundle.main.appVersion,
            "premium": s.premium,
            "price": s.price ?? NSNull(),
            "jws": s.jws ?? NSNull(),
        ]
        let data = (try? JSONSerialization.data(withJSONObject: state)) ?? Data("{}".utf8)
        let json = String(data: data, encoding: .utf8) ?? "{}"
        return """
        (function(){var a=window.QMCApp||{};var s=\(json);for(var k in s)a[k]=s[k];
        a.buy=function(){window.webkit.messageHandlers.qmc.postMessage({cmd:'buy'});};
        a.restore=function(){window.webkit.messageHandlers.qmc.postMessage({cmd:'restore'});};
        window.QMCApp=a;try{window.dispatchEvent(new CustomEvent('qmc-app',{detail:{type:'state'}}));}catch(e){}})();
        """
    }

    private func installScripts() {
        let ucc = webView.configuration.userContentController
        ucc.removeAllUserScripts()
        ucc.addUserScript(WKUserScript(source: stateJS(), injectionTime: .atDocumentStart, forMainFrameOnly: true))
        ucc.addUserScript(WKUserScript(source: Self.viewportJS, injectionTime: .atDocumentEnd, forMainFrameOnly: true))
    }

    private func storeChanged() {
        installScripts()
        webView.evaluateJavaScript(stateJS(), completionHandler: nil)
    }

    private func emit(_ type: String, status: String) {
        storeChanged()
        let js = "try{window.dispatchEvent(new CustomEvent('qmc-app',{detail:{type:'\(type)',status:'\(status)'}}));}catch(e){}"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    // MARK: - actions

    @objc private func reloadPage() {
        if webView.url == nil { webView.load(URLRequest(url: start)) } else { webView.reload() }
    }

    private func retry() {
        offline.isHidden = true
        if let url = webView.url, url.absoluteString != "about:blank" { webView.reload() } else { webView.load(URLRequest(url: start)) }
    }

    private func openOutside(_ url: URL) {
        let scheme = url.scheme?.lowercased() ?? ""
        let appHosts = ["wa.me", "api.whatsapp.com", "t.me", "apps.apple.com", "itunes.apple.com", "maps.apple.com"]
        if (scheme == "http" || scheme == "https") && !appHosts.contains(url.host?.lowercased() ?? "") {
            let safari = SFSafariViewController(url: url)
            safari.preferredControlTintColor = Self.brand
            present(safari, animated: true)
        } else {
            UIApplication.shared.open(url)
        }
    }

    private func showOffline(for error: Error) {
        refresh.endRefreshing()
        let code = (error as NSError).code
        if code == NSURLErrorCancelled { return }
        let noNet = [NSURLErrorNotConnectedToInternet, NSURLErrorNetworkConnectionLost, NSURLErrorTimedOut,
                     NSURLErrorCannotFindHost, NSURLErrorCannotConnectToHost, NSURLErrorDNSLookupFailed, NSURLErrorDataNotAllowed]
        if noNet.contains(code) { offline.isHidden = false }
    }
}

// MARK: - navigation

extension WebViewController: WKNavigationDelegate {
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { return decisionHandler(.allow) }
        let scheme = url.scheme?.lowercased() ?? ""
        if ["about", "data", "blob", "javascript"].contains(scheme) { return decisionHandler(.allow) }
        // frames inside the page (reCAPTCHA, video) load normally
        if let frame = navigationAction.targetFrame, !frame.isMainFrame { return decisionHandler(.allow) }
        if (scheme == "http" || scheme == "https") && Site.isOwn(url) {
            if navigationAction.targetFrame == nil {   // target="_blank" on our own site: stay in the app
                webView.load(navigationAction.request)
                return decisionHandler(.cancel)
            }
            return decisionHandler(.allow)
        }
        openOutside(url)
        decisionHandler(.cancel)
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationResponse: WKNavigationResponse, decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
        if !navigationResponse.canShowMIMEType, let url = navigationResponse.response.url {
            openOutside(url)   // files the app cannot show (e.g. the Android APK) open in Safari
            return decisionHandler(.cancel)
        }
        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        refresh.endRefreshing()
        offline.isHidden = true
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        showOffline(for: error)
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        showOffline(for: error)
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        webView.reload()
    }
}

// MARK: - dialogs, new windows, microphone

extension WebViewController: WKUIDelegate {
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url {
            if Site.isOwn(url) { webView.load(navigationAction.request) } else { openOutside(url) }
        }
        return nil
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: NSLocalizedString("ok", comment: ""), style: .default) { _ in completionHandler() })
        present(alert, animated: true)
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: NSLocalizedString("cancel", comment: ""), style: .cancel) { _ in completionHandler(false) })
        alert.addAction(UIAlertAction(title: NSLocalizedString("ok", comment: ""), style: .default) { _ in completionHandler(true) })
        present(alert, animated: true)
    }

    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
        let alert = UIAlertController(title: nil, message: prompt, preferredStyle: .alert)
        alert.addTextField { $0.text = defaultText }
        alert.addAction(UIAlertAction(title: NSLocalizedString("cancel", comment: ""), style: .cancel) { _ in completionHandler(nil) })
        alert.addAction(UIAlertAction(title: NSLocalizedString("ok", comment: ""), style: .default) { _ in completionHandler(alert.textFields?.first?.text) })
        present(alert, animated: true)
    }

    // recitation check and "record and compare" use the microphone; iOS still asks the learner once
    func webView(_ webView: WKWebView, requestMediaCapturePermissionFor origin: WKSecurityOrigin, initiatedByFrame frame: WKFrameInfo, type: WKMediaCaptureType, decisionHandler: @escaping (WKPermissionDecision) -> Void) {
        decisionHandler(Site.isOwnHost(origin.host) ? .grant : .deny)
    }
}

// MARK: - bridge: window.QMCApp.buy() / .restore()

extension WebViewController: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame, Site.isOwn(message.frameInfo.request.url),
              let body = message.body as? [String: Any], let cmd = body["cmd"] as? String else { return }
        Task { @MainActor in
            switch cmd {
            case "buy": emit("purchase", status: await Store.shared.buy())
            case "restore": emit("restore", status: await Store.shared.restore())
            default: break
            }
        }
    }
}

/// WKUserContentController keeps its handlers alive; this proxy avoids a retain cycle with the controller
private final class WeakMessageHandler: NSObject, WKScriptMessageHandler {
    weak var target: WKScriptMessageHandler?
    init(_ target: WKScriptMessageHandler) { self.target = target }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        target?.userContentController(userContentController, didReceive: message)
    }
}

// MARK: - offline screen

final class OfflineView: UIView {
    var onRetry: (() -> Void)?

    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = WebViewController.brand
        let logo = UIImageView(image: UIImage(named: "LaunchLogo"))
        logo.contentMode = .scaleAspectFit
        logo.layer.cornerRadius = 22
        logo.clipsToBounds = true
        logo.heightAnchor.constraint(equalToConstant: 96).isActive = true
        logo.widthAnchor.constraint(equalToConstant: 96).isActive = true

        let title = UILabel()
        title.text = NSLocalizedString("offline.title", comment: "")
        title.font = .systemFont(ofSize: 22, weight: .bold)
        title.textColor = .white
        title.textAlignment = .center
        title.numberOfLines = 0

        let body = UILabel()
        body.text = NSLocalizedString("offline.body", comment: "")
        body.font = .systemFont(ofSize: 16)
        body.textColor = UIColor.white.withAlphaComponent(0.75)
        body.textAlignment = .center
        body.numberOfLines = 0

        var button = UIButton.Configuration.filled()
        button.title = NSLocalizedString("offline.retry", comment: "")
        button.baseBackgroundColor = WebViewController.gold
        button.baseForegroundColor = WebViewController.brand
        button.cornerStyle = .capsule
        button.contentInsets = NSDirectionalEdgeInsets(top: 12, leading: 28, bottom: 12, trailing: 28)
        let retry = UIButton(configuration: button, primaryAction: UIAction { [weak self] _ in self?.onRetry?() })

        let stack = UIStackView(arrangedSubviews: [logo, title, body, retry])
        stack.axis = .vertical
        stack.alignment = .center
        stack.spacing = 16
        stack.setCustomSpacing(28, after: body)
        stack.translatesAutoresizingMaskIntoConstraints = false
        addSubview(stack)
        NSLayoutConstraint.activate([
            stack.centerYAnchor.constraint(equalTo: centerYAnchor),
            stack.leadingAnchor.constraint(equalTo: layoutMarginsGuide.leadingAnchor, constant: 16),
            stack.trailingAnchor.constraint(equalTo: layoutMarginsGuide.trailingAnchor, constant: -16),
        ])
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }
}
