import Foundation
import Observation
import UIKit

struct ModelFile: Codable, Identifiable, Sendable {
    let id: String
    let name: String
    let filename: String
    let url: URL
    let bytes: Int64
    let sha256: String
}

@MainActor @Observable
final class ModelStore: NSObject, URLSessionDownloadDelegate {
    let files: [ModelFile]
    nonisolated let directory: URL
    var verified: Set<String> = []
    var downloaded: [String: Int64] = [:]
    var currentID: String?
    var verifyingID: String?
    var error: String?
    private var session: URLSession!
    private var activeTaskID: Int?
    private var keepDownloading = false {
        didSet { UserDefaults.standard.set(keepDownloading, forKey: "downloadRequested") }
    }
    private var reconciling = true
    private var lastStatusWrite = Date.distantPast
    private var completion: (() -> Void)?
    private var taskDiagnostics: [[String: Any]] = []
    private var diagnosticTimer: Timer?

    var ready: Bool { verified.count == files.count }
    var busy: Bool { currentID != nil || verifyingID != nil }
    var totalBytes: Int64 { files.reduce(0) { $0 + $1.bytes } }
    var receivedBytes: Int64 { files.reduce(0) { $0 + (verified.contains($1.id) ? $1.bytes : downloaded[$1.id, default: 0]) } }

    override init() {
        directory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("Models", isDirectory: true)
        files = try! JSONDecoder().decode([ModelFile].self, from: Data(contentsOf: Bundle.main.url(forResource: "ModelManifest", withExtension: "json")!))
        super.init()
        keepDownloading = UserDefaults.standard.bool(forKey: "downloadRequested")
        do {
            try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
            var folder = directory
            var values = URLResourceValues(); values.isExcludedFromBackup = true
            try folder.setResourceValues(values)
        } catch { self.error = error.localizedDescription; self.writeStatus() }
        refresh()
        let foreground = ProcessInfo.processInfo.arguments.contains("--foreground-downloads")
        if foreground {
            let legacy = URLSession(configuration: .background(withIdentifier: "com.pocketimage.studio.models.v1"))
            legacy.getAllTasks { tasks in
                tasks.forEach { $0.cancel() }
                legacy.invalidateAndCancel()
            }
        }
        let config = foreground ? URLSessionConfiguration.default : URLSessionConfiguration.background(withIdentifier: "com.pocketimage.studio.models.v1")
        config.allowsCellularAccess = false
        config.isDiscretionary = false
        config.sessionSendsLaunchEvents = !foreground
        config.waitsForConnectivity = true
        config.timeoutIntervalForResource = 7 * 24 * 3600
        config.httpMaximumConnectionsPerHost = 1
        config.timeoutIntervalForRequest = 60
        config.requestCachePolicy = .reloadIgnoringLocalCacheData
        session = URLSession(configuration: config, delegate: self, delegateQueue: .main)
        diagnosticTimer = Timer.scheduledTimer(withTimeInterval: 5, repeats: true) { [weak self] _ in
            Task { @MainActor in self?.inspectTasks() }
        }
        session.getAllTasks { tasks in
            Task { @MainActor in
                self.reconciling = false
                if ProcessInfo.processInfo.arguments.contains("--restart-downloads") {
                    self.activeTaskID = nil
                    for task in tasks { task.cancel() }
                    for file in self.files {
                        try? FileManager.default.removeItem(at: self.directory.appendingPathComponent(file.id + ".resume"))
                    }
                    self.currentID = nil
                    self.keepDownloading = true
                    self.recoverStaging(); self.next()
                    return
                }
                if let task = tasks.first {
                    self.currentID = task.taskDescription
                    self.activeTaskID = task.taskIdentifier
                    if let id = task.taskDescription { self.downloaded[id] = task.countOfBytesReceived }
                    if task.state == .suspended { task.resume() }
                    self.keepDownloading = !ProcessInfo.processInfo.arguments.contains("--pause-downloads")
                    if !self.keepDownloading { self.pause() }
                } else {
                    self.recoverStaging()
                    self.next()
                }
            }
        }
    }

    private func inspectTasks() {
        guard busy else {
            if !taskDiagnostics.isEmpty {
                taskDiagnostics = []; lastStatusWrite = .distantPast; writeStatus()
            }
            return
        }
        session.getAllTasks { tasks in
            let values: [[String: Any]] = tasks.map { task in
                ["id": task.taskIdentifier, "model": task.taskDescription ?? "", "state": task.state.rawValue,
                 "received": task.countOfBytesReceived, "expected": task.countOfBytesExpectedToReceive,
                 "host": task.currentRequest?.url?.host ?? "", "http": (task.response as? HTTPURLResponse)?.statusCode ?? 0]
            }
            Task { @MainActor in
                self.taskDiagnostics = values
                self.lastStatusWrite = .distantPast; self.writeStatus()
            }
        }
    }

    func url(for file: ModelFile) -> URL { directory.appendingPathComponent(file.filename) }
    func fileURL(_ id: String) -> URL { url(for: files.first { $0.id == id }!) }

    func writeStatus() {
        guard Date().timeIntervalSince(lastStatusWrite) >= 1 else { return }
        lastStatusWrite = Date()
        let status: [String: Any] = ["ready": ready, "receivedBytes": receivedBytes, "totalBytes": totalBytes, "current": currentID ?? "", "verifying": verifyingID ?? "", "error": error ?? "", "timestamp": Date().ISO8601Format(), "tasks": taskDiagnostics]
        if let data = try? JSONSerialization.data(withJSONObject: status, options: [.sortedKeys]) {
            try? data.write(to: directory.appendingPathComponent("download-status.json"), options: .atomic)
        }
    }

    func refresh() {
        verified = Set(files.filter { file in
            let marker = directory.appendingPathComponent(file.id + ".verified")
            let attrs = try? FileManager.default.attributesOfItem(atPath: url(for: file).path)
            return (attrs?[.size] as? NSNumber)?.int64Value == file.bytes &&
                (try? String(contentsOf: marker, encoding: .utf8)) == file.sha256
        }.map(\.id))
    }

    func start() {
        guard !busy else { return }
        error = nil; keepDownloading = true
        guard !reconciling else { return }
        next()
    }

    private func next() {
        guard !reconciling, keepDownloading, !busy, let file = files.first(where: { !verified.contains($0.id) }) else { return }
        do {
            let resources = try directory.resourceValues(forKeys: [.volumeAvailableCapacityForImportantUsageKey])
            let required = files.filter { !verified.contains($0.id) }.reduce(Int64(1_073_741_824)) { $0 + $1.bytes }
            guard (resources.volumeAvailableCapacityForImportantUsage ?? 0) > required else {
                throw ImageError.message("Free at least \(ByteCountFormatter.string(fromByteCount: required, countStyle: .file)) on your iPhone to download the remaining files.")
            }
            currentID = file.id
            writeStatus()
            let resumeURL = directory.appendingPathComponent(file.id + ".resume")
            let task: URLSessionDownloadTask
            if let data = try? Data(contentsOf: resumeURL) {
                task = session.downloadTask(withResumeData: data)
                try? FileManager.default.removeItem(at: resumeURL)
            } else {
                var components = URLComponents(url: file.url, resolvingAgainstBaseURL: false)!
                components.queryItems = [URLQueryItem(name: "download", value: "true"), URLQueryItem(name: "request", value: UUID().uuidString)]
                var request = URLRequest(url: components.url!, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 60)
                request.setValue("no-cache", forHTTPHeaderField: "Cache-Control")
                task = session.downloadTask(with: request)
            }
            activeTaskID = task.taskIdentifier
            task.taskDescription = file.id; task.priority = URLSessionTask.highPriority; task.resume()
        } catch { self.error = error.localizedDescription; currentID = nil; keepDownloading = false; writeStatus() }
    }

    func pause() {
        keepDownloading = false
        session.getAllTasks { tasks in
            for task in tasks {
                guard let download = task as? URLSessionDownloadTask else { continue }
                let id = task.taskDescription
                let directory = self.directory
                download.cancel(byProducingResumeData: { data in
                    if let id, let data { try? data.write(to: directory.appendingPathComponent(id + ".resume"), options: .atomic) }
                })
            }
        }
    }

    func receiveBackgroundCompletion(_ handler: @escaping () -> Void) { completion = handler }

    private func finishBackgroundEvents() {
        guard verifyingID == nil else { return }
        completion?(); completion = nil
    }

    private func recoverStaging() {
        if let file = files.first(where: { FileManager.default.fileExists(atPath: directory.appendingPathComponent($0.id + ".staging").path) }) {
            verify(file)
        }
    }

    private func verify(_ file: ModelFile) {
        guard verifyingID == nil else { return }
        currentID = nil; verifyingID = file.id
        var backgroundID = UIBackgroundTaskIdentifier.invalid
        backgroundID = UIApplication.shared.beginBackgroundTask(withName: "Verify model") {
            if backgroundID != .invalid {
                UIApplication.shared.endBackgroundTask(backgroundID)
                backgroundID = .invalid
            }
        }
        let staged = directory.appendingPathComponent(file.id + ".staging")
        let target = url(for: file)
        let marker = directory.appendingPathComponent(file.id + ".verified")
        Task {
            defer {
                if backgroundID != .invalid { UIApplication.shared.endBackgroundTask(backgroundID) }
                finishBackgroundEvents()
            }
            do {
                try await Task.detached(priority: .utility) {
                    try ModelIntegrity.verify(url: staged, bytes: file.bytes, sha256: file.sha256)
                    if FileManager.default.fileExists(atPath: target.path) { try FileManager.default.removeItem(at: target) }
                    try FileManager.default.moveItem(at: staged, to: target)
                    try file.sha256.write(to: marker, atomically: true, encoding: .utf8)
                }.value
                verified.insert(file.id); downloaded[file.id] = nil
                if ready { keepDownloading = false }
                verifyingID = nil
                lastStatusWrite = .distantPast; writeStatus()
                recoverStaging()
                next()
            } catch {
                try? FileManager.default.removeItem(at: staged)
                verifyingID = nil; keepDownloading = false
                self.error = error.localizedDescription
                lastStatusWrite = .distantPast; writeStatus()
            }
        }
    }

    nonisolated func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didWriteData bytesWritten: Int64, totalBytesWritten: Int64, totalBytesExpectedToWrite: Int64) {
        guard let id = downloadTask.taskDescription else { return }
        Task { @MainActor in
            guard self.activeTaskID == downloadTask.taskIdentifier else { return }
            self.error = nil; self.downloaded[id] = totalBytesWritten; self.writeStatus()
        }
    }

    nonisolated func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didFinishDownloadingTo location: URL) {
        guard let id = downloadTask.taskDescription, ["diffusion", "encoder", "vae"].contains(id) else { return }
        let staged = directory.appendingPathComponent(id + ".staging")
        do {
            guard let response = downloadTask.response as? HTTPURLResponse, (200...299).contains(response.statusCode) else {
                throw ImageError.message("Model server rejected the download. Please retry.")
            }
            try? FileManager.default.removeItem(at: staged)
            try FileManager.default.moveItem(at: location, to: staged)
            Task { @MainActor in
                if let file = self.files.first(where: { $0.id == id }) { self.verify(file) }
            }
        } catch {
            Task { @MainActor in self.currentID = nil; self.keepDownloading = false; self.error = error.localizedDescription; self.writeStatus() }
        }
    }

    nonisolated func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        guard let error else { return }
        let ns = error as NSError
        Task { @MainActor in
            guard self.activeTaskID == task.taskIdentifier else { return }
            if let id = task.taskDescription, let resume = ns.userInfo[NSURLSessionDownloadTaskResumeData] as? Data {
                try? resume.write(to: self.directory.appendingPathComponent(id + ".resume"), options: .atomic)
            }
            self.activeTaskID = nil
            self.currentID = nil; self.keepDownloading = false
            if ns.code != NSURLErrorCancelled { self.error = error.localizedDescription }
            self.lastStatusWrite = .distantPast; self.writeStatus()
        }
    }

    nonisolated func urlSession(_ session: URLSession, taskIsWaitingForConnectivity task: URLSessionTask) {
        Task { @MainActor in
            guard self.activeTaskID == task.taskIdentifier else { return }
            self.error = "Waiting for a Wi-Fi connection. Check that Wi-Fi has internet access."
            self.lastStatusWrite = .distantPast; self.writeStatus()
        }
    }

    nonisolated func urlSessionDidFinishEvents(forBackgroundURLSession session: URLSession) {
        Task { @MainActor in self.finishBackgroundEvents() }
    }
}
