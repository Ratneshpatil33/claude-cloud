import SwiftUI

struct AppView: View {
    @Bindable var studio: ImageStudio
    @State private var selectedTab = 0
    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack { CreateView(studio: studio) }
                .tabItem { Label("Create", systemImage: "sparkles") }.tag(0)
            NavigationStack { GalleryView(studio: studio) }
                .tabItem { Label("Gallery", systemImage: "photo.stack") }.tag(1)
            NavigationStack { ModelsView(models: studio.models, studio: studio) }
                .tabItem { Label("Model", systemImage: "square.stack.3d.up") }.tag(2)
        }
        .alert("PocketImage", isPresented: Binding(get: { studio.error != nil }, set: { if !$0 { studio.error = nil } })) {
            Button("OK", role: .cancel) { studio.error = nil }
        } message: { Text(studio.error ?? "") }
    }
}

private struct CreateView: View {
    @Bindable var studio: ImageStudio
    @FocusState private var promptFocused: Bool
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 10) {
                    Label("MADE ON YOUR IPHONE", systemImage: "iphone.gen3")
                        .font(.caption.weight(.bold)).tracking(2).foregroundStyle(.orange)
                    Text("Imagine it.\nMake it yours.")
                        .font(.system(size: 42, weight: .bold, design: .rounded))
                    Text("Qwen-Image-2.1-Turbo")
                        .font(.subheadline).foregroundStyle(.secondary)
                }
                if let message = studio.pendingRecoveryMessage {
                    Label(message, systemImage: "exclamationmark.triangle")
                        .font(.callout).foregroundStyle(.orange)
                    Button("Dismiss") { studio.pendingRecoveryMessage = nil }
                }
                if !studio.models.ready {
                    VStack(alignment: .leading, spacing: 12) {
                        Label("Download your image model", systemImage: "arrow.down.circle")
                            .font(.headline)
                        Text("About 9.9 GB over Wi-Fi. Downloads go directly to this iPhone and are verified before use.")
                            .font(.subheadline).foregroundStyle(.secondary)
                        if studio.models.busy {
                            ProgressView(value: Double(studio.models.receivedBytes), total: Double(studio.models.totalBytes))
                            Text(studio.models.verifyingID == nil ? "Downloading… See Model for details." : "Verifying download…")
                                .font(.caption).foregroundStyle(.secondary)
                        } else {
                            Button("Download model") { studio.models.start() }
                                .buttonStyle(.borderedProminent)
                        }
                        if let error = studio.models.error { Text(error).font(.caption).foregroundStyle(.orange) }
                    }.padding().background(.thinMaterial, in: RoundedRectangle(cornerRadius: 24))
                }
                VStack(alignment: .leading, spacing: 12) {
                    Text("Describe your image").font(.headline)
                    TextEditor(text: $studio.prompt)
                        .frame(minHeight: 140)
                        .scrollContentBackground(.hidden)
                        .focused($promptFocused)
                        .accessibilityLabel("Image prompt")
                    Text("\(studio.prompt.count) / 1,000 characters")
                        .font(.caption).foregroundStyle(studio.prompt.count > 1000 ? .red : .secondary)
                }.padding().background(Color.white.opacity(0.05), in: RoundedRectangle(cornerRadius: 24))
                    .disabled(studio.isGenerating)
                VStack(alignment: .leading, spacing: 16) {
                    Picker("Image size", selection: $studio.size) {
                        Text("512 × 512").tag(512)
                        Text("768 × 768").tag(768)
                    }.pickerStyle(.segmented)
                    Toggle("New seed each time", isOn: $studio.randomSeed)
                    if !studio.randomSeed {
                        TextField("Seed", text: $studio.seedText).keyboardType(.numberPad)
                    }
                    Label("8 steps · guidance 1 · PNG", systemImage: "slider.horizontal.3")
                        .font(.caption).foregroundStyle(.secondary)
                    Text("Device preview: speed and memory use are still being verified. Start at 512 × 512 and keep the app open.")
                        .font(.caption).foregroundStyle(.secondary)
                }.disabled(studio.isGenerating)
                if studio.isGenerating {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack { ProgressView(); Text(studio.stage).font(.headline) }
                        if studio.step > 0 { ProgressView(value: Double(studio.step), total: Double(max(1, studio.total))) }
                        Button("Stop generation", role: .destructive) { studio.cancel() }
                    }
                } else {
                    Button {
                        promptFocused = false; studio.generate()
                    } label: {
                        Label("Generate image", systemImage: "sparkles")
                            .font(.headline).frame(maxWidth: .infinity).padding(.vertical, 12)
                    }.buttonStyle(.borderedProminent).buttonBorderShape(.roundedRectangle(radius: 20))
                        .disabled(!studio.models.ready || studio.prompt.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || studio.prompt.count > 1000)
                }
                if let item = studio.latest {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Latest image").font(.headline)
                        ImagePreview(url: studio.imageURL(item))
                        Text(item.prompt).font(.subheadline).foregroundStyle(.secondary)
                        ShareLink(item: studio.imageURL(item)) { Label("Share PNG", systemImage: "square.and.arrow.up") }
                    }
                }
                Label("Images and prompts stay on this iPhone.", systemImage: "lock.shield")
                    .font(.caption).foregroundStyle(.secondary).frame(maxWidth: .infinity)
            }.padding(24)
        }
        .scrollDismissesKeyboard(.interactively)
        .navigationTitle("PocketImage").navigationBarTitleDisplayMode(.inline)
        .toolbar { ToolbarItemGroup(placement: .keyboard) { Spacer(); Button("Done") { promptFocused = false } } }
    }
}

private struct ModelsView: View {
    @Bindable var models: ModelStore
    let studio: ImageStudio
    var body: some View {
        List {
            Section {
                Text("Qwen-Image-2.1-Turbo").font(.headline)
                Text("Text-to-image · quantized for a smaller memory footprint").font(.subheadline).foregroundStyle(.secondary)
                ForEach(models.files) { file in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(file.name)
                            Spacer()
                            if models.verified.contains(file.id) { Image(systemName: "checkmark.seal.fill").foregroundStyle(.green) }
                            else if models.verifyingID == file.id { ProgressView() }
                        }
                        Text(ByteCountFormatter.string(fromByteCount: file.bytes, countStyle: .file)).font(.caption).foregroundStyle(.secondary)
                        if models.currentID == file.id {
                            ProgressView(value: Double(models.downloaded[file.id, default: 0]), total: Double(file.bytes))
                            Text(ByteCountFormatter.string(fromByteCount: models.downloaded[file.id, default: 0], countStyle: .file) + " downloaded")
                                .font(.caption).foregroundStyle(.secondary)
                        }
                        if models.verifyingID == file.id { Text("Checking SHA-256…").font(.caption).foregroundStyle(.secondary) }
                    }
                }
            } footer: {
                Text("Three files, about 9.9 GB. Uses Wi-Fi only. Completed files are kept if a later download fails. Downloads can continue while the app is closed; generation requires the app to stay open.")
            }
            if let error = models.error { Section { Text(error).foregroundStyle(.orange) } }
            if !models.ready {
                Section {
                    if models.currentID != nil { Button("Pause downloads") { models.pause() } }
                    else if models.verifyingID == nil { Button("Download / resume") { models.start() } }
                }
            }
            Section("About this build") {
                Text("Metal GPU runtime with disk-backed weights. The first release is for device validation; generation speed and maximum image size have not yet been established.")
                    .font(.footnote).foregroundStyle(.secondary)
                if let log = studio.lastLog { ShareLink("Share latest diagnostic log", item: log) }
                Link("Official model & license", destination: URL(string: "https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo")!)
            }
        }.navigationTitle("Model")
    }
}

private struct GalleryView: View {
    @Bindable var studio: ImageStudio
    var body: some View {
        Group {
            if studio.saved.isEmpty {
                ContentUnavailableView("Your ideas live here", systemImage: "photo.stack", description: Text("Completed images will appear here, ready to share."))
            } else {
                List {
                    ForEach(studio.saved) { item in
                        VStack(alignment: .leading, spacing: 12) {
                            ImagePreview(url: studio.imageURL(item))
                            Text(item.prompt).font(.subheadline)
                            Text("\(item.width) × \(item.height) · seed \(item.seed) · \(item.elapsed, specifier: "%.1f")s")
                                .font(.caption).foregroundStyle(.secondary)
                            ShareLink(item: studio.imageURL(item)) { Label("Share PNG", systemImage: "square.and.arrow.up") }
                        }.padding(.vertical, 8)
                    }.onDelete { indices in
                        for item in indices.map({ studio.saved[$0] }) { studio.delete(item) }
                    }
                }
            }
        }.navigationTitle("Gallery")
    }
}

private struct ImagePreview: View {
    let url: URL
    @State private var image: UIImage?
    var body: some View {
        Group {
            if let image { Image(uiImage: image).resizable().scaledToFit() }
            else { RoundedRectangle(cornerRadius: 20).fill(.quaternary).aspectRatio(1, contentMode: .fit).overlay { ProgressView() } }
        }.clipShape(RoundedRectangle(cornerRadius: 20))
            .task(id: url) {
                image = await Task.detached(priority: .utility) { UIImage(contentsOfFile: url.path) }.value
            }
    }
}
