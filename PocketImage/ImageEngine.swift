import Foundation

enum ImageError: LocalizedError {
    case message(String)
    var errorDescription: String? { if case .message(let text) = self { return text }; return nil }
}

struct ImageRequest: Sendable {
    let prompt: String
    let width: Int
    let height: Int
    let seed: Int64

    func validate() throws {
        guard !prompt.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, prompt.count <= 1000 else {
            throw ImageError.message("Enter a prompt of 1–1,000 characters.")
        }
        guard width >= 256, height >= 256, width <= 768, height <= 768, width % 32 == 0, height % 32 == 0 else {
            throw ImageError.message("Choose a supported image size.")
        }
        guard seed >= 0 else { throw ImageError.message("Seed must be a nonnegative whole number.") }
    }
}

private final class ImageProgress: @unchecked Sendable {
    let update: @Sendable (String, Int, Int) -> Void
    init(_ update: @escaping @Sendable (String, Int, Int) -> Void) { self.update = update }
}

actor ImageEngine {
    private var session: OpaquePointer?
    private var installationKey = ""
    private var expiry: Task<Void, Never>?
    private var generation = 0

    func releaseResources() {
        expiry?.cancel(); expiry = nil
        if let session { pi_session_release(session) }
        session = nil; installationKey = ""
    }

    private func key(for files: [URL]) throws -> String {
        try files.map { file in
            let a = try FileManager.default.attributesOfItem(atPath: file.path)
            return "\(file.path)|\(a[.size]!)|\(a[.modificationDate]!)|\(a[.systemFileNumber]!)"
        }.joined(separator: "|")
    }

    func generate(_ request: ImageRequest, model: URL, encoder: URL, vae: URL, output: URL, log: URL,
                  update: @escaping @Sendable (String, Int, Int) -> Void) throws {
        try request.validate()
        try Task.checkCancellation()
        expiry?.cancel()
        let optimized = !ProcessInfo.processInfo.arguments.contains("--baseline-generation")
        let key = try key(for: [model, encoder, vae]) + "|\(optimized)"
        if installationKey != key || session == nil {
            releaseResources()
            session = pi_session_create(model.path, encoder.path, vae.path, optimized ? 1 : 0)
            installationKey = key
        }
        guard let session else { throw ImageError.message("Could not create an image session.") }
        generation += 1
        let current = generation
        defer {
            expiry = Task { [weak self] in
                do { try await Task.sleep(for: .seconds(60)) } catch { return }
                await self?.expire(current)
            }
        }
        let box = ImageProgress(update)
        let pointer = Unmanaged.passRetained(box).toOpaque()
        defer { Unmanaged<ImageProgress>.fromOpaque(pointer).release() }
        var error = [CChar](repeating: 0, count: 2048)
        let success = pi_session_generate(session, request.prompt,
                                  Int32(request.width), Int32(request.height), request.seed,
                                  output.path, log.path, { text, step, total, user in
            guard let user, let text else { return }
            let box = Unmanaged<ImageProgress>.fromOpaque(user).takeUnretainedValue()
            box.update(String(cString: text), Int(step), Int(total))
        }, pointer, &error, error.count)
        try Task.checkCancellation()
        guard success == 1 else { releaseResources(); throw ImageError.message(String(cString: error)) }
    }
    private func expire(_ token: Int) {
        if token == generation { releaseResources() }
    }
}
