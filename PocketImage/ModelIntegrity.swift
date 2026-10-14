import Foundation
import CryptoKit

enum ModelIntegrity {
    static func verify(url: URL, bytes: Int64, sha256: String) throws {
        let attrs = try FileManager.default.attributesOfItem(atPath: url.path)
        guard (attrs[.size] as? NSNumber)?.int64Value == bytes else {
            throw ImageError.message("Download size mismatch. Please retry.")
        }
        let handle = try FileHandle(forReadingFrom: url)
        defer { try? handle.close() }
        var hash = SHA256()
        while let chunk = try handle.read(upToCount: 4 * 1024 * 1024), !chunk.isEmpty {
            hash.update(data: chunk)
        }
        let digest = hash.finalize().map { String(format: "%02x", $0) }.joined()
        guard digest == sha256 else { throw ImageError.message("Download checksum mismatch. Please retry.") }
    }
}
