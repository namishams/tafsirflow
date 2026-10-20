import UIKit

final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    private var web: WebViewController? { window?.rootViewController as? WebViewController }

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        let link = connectionOptions.userActivities.first { $0.activityType == NSUserActivityTypeBrowsingWeb }?.webpageURL
        let scheme = connectionOptions.urlContexts.first.flatMap { Site.url(fromScheme: $0.url) }
        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = WebViewController(start: link ?? scheme ?? Site.lastPage ?? Site.home)
        window.makeKeyAndVisible()
        self.window = window
    }

    // a quranmasterclass.com link tapped elsewhere (Messages, Mail, Safari) while the app is running
    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        guard userActivity.activityType == NSUserActivityTypeBrowsingWeb, let url = userActivity.webpageURL else { return }
        web?.open(url)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        if let url = URLContexts.first.flatMap({ Site.url(fromScheme: $0.url) }) { web?.open(url) }
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        web?.rememberPage()
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        Task { await Store.shared.refresh() }
    }
}
