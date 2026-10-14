import SwiftUI
import Observation

struct SavedImage: Codable, Identifiable {
    let id: UUID
    let prompt: String
    let seed: Int64
    let width: Int
    let height: Int
    let createdAt: Date
    let elapsed: Double
    let model: String
}

@MainActor @Observable
final class ImageStudio {
    let models = ModelStore()
    var prompt = "A small red panda painting at an easel in a sunlit garden, soft watercolor illustration."
    var size = 512
    var seedText = "42"
    var randomSeed = true
    var isGenerating = false
    var stage = "Ready"
    var step = 0
    var total = 8
    var error: String?
    var saved: [SavedImage] = []
    var latest: SavedImage?
    var pendingRecoveryMessage: String?
    let root: URL
    private let engine = ImageEngine()
    private var generationTask: Task<Void, Never>?
    private var interrupted = false
    private var interruptionReason = ""
    private var activeID: UUID?

    private func writeRunStatus(_ status: String, detail: String = "") {
        let payload: [String: Any] = ["status": status, "detail": detail, "id": activeID?.uuidString ?? "", "stage": stage, "step": step, "date": Date().timeIntervalSince1970]
        if let data = try? JSONSerialization.data(withJSONObject: payload, options: [.sortedKeys]) {
            try? data.write(to: root.appendingPathComponent("Diagnostics/run-status.json"), options: .atomic)
        }
    }

    init() {
        root = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        for folder in ["Images", "Diagnostics"] { try? FileManager.default.createDirectory(at: root.appendingPathComponent(folder), withIntermediateDirectories: true) }
        loadGallery()
        let marker = root.appendingPathComponent("active-generation.json")
        if FileManager.default.fileExists(atPath: marker.path) {
            pendingRecoveryMessage = "The previous generation was interrupted. iOS may have closed the app or run out of memory. No unfinished image was added to your gallery."
            try? FileManager.default.removeItem(at: marker)
        }
        if let files = try? FileManager.default.contentsOfDirectory(at: root.appendingPathComponent("Images"), includingPropertiesForKeys: nil) {
            for file in files where file.lastPathComponent.hasSuffix(".partial.png") { try? FileManager.default.removeItem(at: file) }
        }
    }

    func imageURL(_ item: SavedImage) -> URL { root.appendingPathComponent("Images/\(item.id.uuidString).png") }
    var lastLog: URL? {
        let urls = (try? FileManager.default.contentsOfDirectory(at: root.appendingPathComponent("Diagnostics"), includingPropertiesForKeys: [.contentModificationDateKey])) ?? []
        return urls.filter { $0.pathExtension == "log" }.sorted {
            ((try? $0.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate) ?? .distantPast) >
            ((try? $1.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate) ?? .distantPast)
        }.first
    }

    func loadGallery() {
        let folder = root.appendingPathComponent("Images")
        saved = ((try? FileManager.default.contentsOfDirectory(at: folder, includingPropertiesForKeys: nil)) ?? [])
            .filter { $0.pathExtension == "json" }
            .compactMap { url -> SavedImage? in
                guard let data = try? Data(contentsOf: url), let item = try? JSONDecoder().decode(SavedImage.self, from: data), FileManager.default.fileExists(atPath: imageURL(item).path) else { return nil }
                return item
            }.sorted { $0.createdAt > $1.createdAt }
        latest = saved.first
    }

    func generate() {
        guard !isGenerating, models.ready else { return }
        guard UIApplication.shared.applicationState == .active else { error = "Keep PocketImage open to generate."; return }
        guard ProcessInfo.processInfo.thermalState != .critical else { error = "Let your iPhone cool down before generating."; return }
        let seed: Int64
        if randomSeed { seed = Int64.random(in: 0...Int64(Int32.max)) }
        else if let parsed = Int64(seedText), parsed >= 0 { seed = parsed }
        else { error = "Enter a nonnegative whole-number seed."; return }
        let request = ImageRequest(prompt: prompt, width: size, height: size, seed: seed)
        do { try request.validate() } catch { self.error = error.localizedDescription; return }
        let id = UUID(); let started = Date()
        let partial = root.appendingPathComponent("Images/\(id.uuidString).partial.png")
        let log = root.appendingPathComponent("Diagnostics/\(id.uuidString).log")
        let marker = root.appendingPathComponent("active-generation.json")
        do {
            let available = try root.resourceValues(forKeys: [.volumeAvailableCapacityForImportantUsageKey]).volumeAvailableCapacityForImportantUsage ?? 0
            guard available > 512 * 1024 * 1024 else { throw ImageError.message("Free at least 512 MB to generate and save an image.") }
            try Data(id.uuidString.utf8).write(to: marker, options: .atomic)
        } catch { self.error = error.localizedDescription; return }
        isGenerating = true; interrupted = false; interruptionReason = ""; activeID = id
        stage = "Preparing"; step = 0; error = nil
        writeRunStatus("running")
        UIApplication.shared.isIdleTimerDisabled = true
        let model = models.fileURL("diffusion"), encoder = models.fileURL("encoder"), vae = models.fileURL("vae")
        generationTask = Task {
            defer {
                isGenerating = false; activeID = nil; generationTask = nil
                UIApplication.shared.isIdleTimerDisabled = false
                try? FileManager.default.removeItem(at: marker)
                try? FileManager.default.removeItem(at: partial)
            }
            do {
                try await engine.generate(request, model: model, encoder: encoder, vae: vae, output: partial, log: log) { stage, step, total in
                    Task { @MainActor [weak self] in
                        guard let self, self.activeID == id, !self.interrupted else { return }
                        self.stage = stage; self.step = step; self.total = total
                        self.writeRunStatus("running")
                    }
                }
                guard !interrupted else { throw CancellationError() }
                guard let decoded = UIImage(contentsOfFile: partial.path), Int(decoded.size.width) == request.width, Int(decoded.size.height) == request.height else { throw ImageError.message("The generated image is invalid.") }
                let item = SavedImage(id: id, prompt: request.prompt, seed: seed, width: request.width, height: request.height,
                                      createdAt: started, elapsed: Date().timeIntervalSince(started), model: "Qwen-Image-2.1-Turbo · Q4")
                let final = imageURL(item)
                try FileManager.default.moveItem(at: partial, to: final)
                do { try JSONEncoder().encode(item).write(to: final.deletingPathExtension().appendingPathExtension("json"), options: .atomic) }
                catch { try? FileManager.default.removeItem(at: final); throw error }
                loadGallery(); stage = "Saved to Gallery"
                writeRunStatus("completed", detail: final.lastPathComponent)
            } catch {
                stage = "Generation stopped"
                self.error = interrupted || error is CancellationError ? "Generation interrupted: \(interruptionReason). No unfinished image was saved." : error.localizedDescription
                writeRunStatus("failed", detail: self.error ?? "")
            }
        }
    }

    func releaseIdleResources() { Task { await engine.releaseResources() } }

    func cancel(reason: String = "stopped by you") {
        guard isGenerating else { return }
        interrupted = true; interruptionReason = reason; stage = "Stopping…"
        writeRunStatus("interrupting", detail: reason)
        generationTask?.cancel(); pi_cancel()
    }

    func delete(_ item: SavedImage) {
        do {
            try FileManager.default.removeItem(at: imageURL(item))
            try? FileManager.default.removeItem(at: imageURL(item).deletingPathExtension().appendingPathExtension("json"))
            loadGallery()
        } catch { self.error = error.localizedDescription }
    }
}
