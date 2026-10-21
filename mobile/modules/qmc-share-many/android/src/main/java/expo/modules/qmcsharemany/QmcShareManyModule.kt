package expo.modules.qmcsharemany

import android.content.ClipData
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

// Shares several local files (the slides of a carousel) in one chooser (ACTION_SEND_MULTIPLE). The files are
// handed out through expo-sharing's FileProvider ("<package>.SharingFileProvider", cache and files paths).
class QmcShareManyModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("QmcShareMany")

    AsyncFunction("shareAsync") { urls: List<String>, title: String?, promise: Promise ->
      val activity = appContext.currentActivity
      if (activity == null) {
        promise.reject("E_NO_ACTIVITY", "No activity to start the chooser", null)
        return@AsyncFunction
      }
      val authority = "${activity.packageName}.SharingFileProvider"
      val uris = ArrayList<Uri>()
      for (u in urls) {
        val path = Uri.parse(u).path ?: continue
        val file = File(path)
        if (!file.canRead()) continue
        uris.add(FileProvider.getUriForFile(activity, authority, file))
      }
      if (uris.isEmpty()) {
        promise.reject("E_NO_FILES", "No readable files to share", null)
        return@AsyncFunction
      }
      val intent = Intent(Intent.ACTION_SEND_MULTIPLE).apply {
        type = "image/png"
        putParcelableArrayListExtra(Intent.EXTRA_STREAM, uris)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        val clip = ClipData.newUri(activity.contentResolver, "slides", uris[0])
        for (i in 1 until uris.size) clip.addItem(ClipData.Item(uris[i]))
        clipData = clip
      }
      activity.startActivity(Intent.createChooser(intent, title ?: "").addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION))
      promise.resolve(mapOf("completed" to true, "activity" to ""))
    }
  }
}
