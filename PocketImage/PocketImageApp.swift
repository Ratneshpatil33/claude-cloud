import SwiftUI

@MainActor final class AppDelegate: NSObject, UIApplicationDelegate {
    static weak var models: ModelStore?
    func application(_ application: UIApplication, handleEventsForBackgroundURLSession identifier: String,
                     completionHandler: @escaping () -> Void) {
        Self.models?.receiveBackgroundCompletion(completionHandler)
    }
}

@main
struct PocketImageApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var delegate
    @State private var studio = ImageStudio()
    @Environment(\.scenePhase) private var scenePhase
    @State private var ranDiagnostic = false
    var body: some Scene {
        WindowGroup {
            AppView(studio: studio)
                .tint(.orange)
                .preferredColorScheme(.dark)
                .onAppear {
                    AppDelegate.models = studio.models
                    if ProcessInfo.processInfo.arguments.contains("--pause-downloads") { studio.models.pause() }
                    else if ProcessInfo.processInfo.arguments.contains("--download-models") { studio.models.start() }
                }
                .task {
                    if ProcessInfo.processInfo.arguments.contains("--component-check"), !ranDiagnostic {
                        ranDiagnostic = true
                        let folder = studio.root.appendingPathComponent("ComponentCheck")
                        try? FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
                        UIApplication.shared.isIdleTimerDisabled = true
                        let tensor = !ProcessInfo.processInfo.arguments.contains("--tensor-off")
                        _ = await Task.detached { pi_component_check(folder.path, tensor ? 1 : 0) }.value
                        UIApplication.shared.isIdleTimerDisabled = false
                    }
                    if ProcessInfo.processInfo.arguments.contains("--smoke-generation"), !ranDiagnostic {
                        ranDiagnostic = true
                        try? await Task.sleep(for: .seconds(1))
                        studio.randomSeed = false; studio.seedText = "42"; studio.size = 512
                        studio.generate()
                    }
                }
                .task {
                    guard ProcessInfo.processInfo.arguments.contains("--diagnostic-control") else { return }
                    let trigger = studio.root.appendingPathComponent("Diagnostics/request-repeat")
                    while !Task.isCancelled {
                        try? await Task.sleep(for: .seconds(1))
                        if !studio.isGenerating, FileManager.default.fileExists(atPath: trigger.path) {
                            try? FileManager.default.removeItem(at: trigger)
                            studio.generate()
                        }
                    }
                }
                .onChange(of: scenePhase) { _, phase in
                    if phase == .background { studio.cancel(reason: "PocketImage moved to the background"); studio.releaseIdleResources() }
                }
                .onChange(of: studio.models.busy) { _, busy in
                    if ProcessInfo.processInfo.arguments.contains("--foreground-downloads") {
                        UIApplication.shared.isIdleTimerDisabled = busy || studio.isGenerating
                    }
                }
                .onReceive(NotificationCenter.default.publisher(for: UIApplication.didReceiveMemoryWarningNotification)) { _ in studio.cancel(reason: "iOS reported memory pressure"); studio.releaseIdleResources() }
        }
    }
}
