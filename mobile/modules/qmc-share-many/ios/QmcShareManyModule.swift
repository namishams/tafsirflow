import ExpoModulesCore
import UIKit

// Shares several local files (the slides of a carousel) in ONE system share sheet. Instagram takes them as a
// carousel post; Photos, Messages and WhatsApp take them all at once. expo-sharing only shares one file.
public final class QmcShareManyModule: Module {
  public func definition() -> ModuleDefinition {
    Name("QmcShareMany")

    AsyncFunction("shareAsync") { (urls: [URL], title: String?, promise: Promise) in
      let files = urls.filter { $0.isFileURL && FileManager.default.isReadableFile(atPath: $0.path) }
      if files.isEmpty {
        promise.reject("E_NO_FILES", "No readable files to share")
        return
      }
      guard let current = self.appContext?.utilities?.currentViewController() else {
        promise.reject("E_NO_VIEW_CONTROLLER", "No view controller to present the share sheet")
        return
      }
      let controller = UIActivityViewController(activityItems: files, applicationActivities: nil)
      controller.title = title
      controller.completionWithItemsHandler = { activity, completed, _, _ in
        promise.resolve(["completed": completed, "activity": activity?.rawValue ?? ""])
      }
      if let popover = controller.popoverPresentationController {
        popover.sourceView = current.view
        popover.sourceRect = CGRect(x: current.view.bounds.midX, y: current.view.bounds.maxY, width: 0, height: 0)
        popover.permittedArrowDirections = []
      }
      current.present(controller, animated: true)
    }
    .runOnQueue(.main)
  }
}
