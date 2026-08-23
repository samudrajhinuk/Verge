// prepare-video — turns the raw source clips into web-ready assets.
//
// Why this exists: the supplied footage is landscape, and eight of the eleven
// files additionally carry a rotation flag of +90° that is simply wrong — the
// pixels are upright landscape, so honouring the flag renders every room on its
// side. This tool ignores the source rotation, centre-crops to the target
// aspect, scales down, drops the audio track (the site autoplays muted) and
// re-encodes. A 4K clip goes from ~34 MB to ~2 MB.
//
// Build:  swiftc -O scripts/prepare-video.swift -o scripts/prepare-video
// Run:    scripts/prepare-video <in.mp4> <out.mp4> <width> <height>
//
// Requires only the macOS command line tools — no ffmpeg, no downloads.

import AVFoundation
import Foundation

let args = CommandLine.arguments
guard args.count == 5,
      let targetW = Double(args[3]),
      let targetH = Double(args[4]) else {
    FileHandle.standardError.write(Data("usage: prepare-video <in> <out> <w> <h>\n".utf8))
    exit(1)
}

let inputURL = URL(fileURLWithPath: args[1])
let outputURL = URL(fileURLWithPath: args[2])
let renderSize = CGSize(width: targetW, height: targetH)

try? FileManager.default.removeItem(at: outputURL)

let asset = AVURLAsset(url: inputURL)
let semaphore = DispatchSemaphore(value: 0)
var failure: String?

Task {
    defer { semaphore.signal() }
    do {
        guard let sourceTrack = try await asset.loadTracks(withMediaType: .video).first else {
            failure = "no video track"
            return
        }

        let duration = try await asset.load(.duration)
        let naturalSize = try await sourceTrack.load(.naturalSize)
        let frameRate = try await sourceTrack.load(.nominalFrameRate)

        // Video only. Leaving the audio track out is both a size win and correct:
        // every video on the site is muted for autoplay.
        let composition = AVMutableComposition()
        guard let compTrack = composition.addMutableTrack(
            withMediaType: .video,
            preferredTrackID: kCMPersistentTrackID_Invalid
        ) else {
            failure = "could not create composition track"
            return
        }
        try compTrack.insertTimeRange(
            CMTimeRange(start: .zero, duration: duration),
            of: sourceTrack,
            at: .zero
        )
        // Deliberately identity: this is what discards the bogus rotation flag.
        compTrack.preferredTransform = .identity

        // Aspect-fill: scale until both axes are covered, then centre the overflow.
        let scale = max(renderSize.width / naturalSize.width,
                        renderSize.height / naturalSize.height)
        let scaledW = naturalSize.width * scale
        let scaledH = naturalSize.height * scale
        let transform = CGAffineTransform(scaleX: scale, y: scale)
            .concatenating(CGAffineTransform(
                translationX: (renderSize.width - scaledW) / 2,
                y: (renderSize.height - scaledH) / 2
            ))

        let layer = AVMutableVideoCompositionLayerInstruction(assetTrack: compTrack)
        layer.setTransform(transform, at: .zero)

        let instruction = AVMutableVideoCompositionInstruction()
        instruction.timeRange = CMTimeRange(start: .zero, duration: duration)
        instruction.layerInstructions = [layer]

        let videoComposition = AVMutableVideoComposition()
        videoComposition.renderSize = renderSize
        videoComposition.frameDuration = CMTime(
            value: 1,
            timescale: CMTimeScale(frameRate > 0 ? min(frameRate, 30) : 30)
        )
        videoComposition.instructions = [instruction]

        // A reader/writer pair rather than AVAssetExportSession, because the
        // export presets do not expose a bitrate and the highest-quality preset
        // produced files larger than the 4K originals. These clips are muted
        // loops behind a 306px-wide card; 2.5 Mbps is generous for that.
        let reader = try AVAssetReader(asset: composition)
        let readerOutput = AVAssetReaderVideoCompositionOutput(
            videoTracks: composition.tracks(withMediaType: .video),
            videoSettings: [kCVPixelBufferPixelFormatTypeKey as String:
                              kCVPixelFormatType_32BGRA]
        )
        readerOutput.videoComposition = videoComposition
        reader.add(readerOutput)

        let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
        let writerInput = AVAssetWriterInput(
            mediaType: .video,
            outputSettings: [
                AVVideoCodecKey: AVVideoCodecType.h264,
                AVVideoWidthKey: Int(renderSize.width),
                AVVideoHeightKey: Int(renderSize.height),
                AVVideoCompressionPropertiesKey: [
                    AVVideoAverageBitRateKey: 2_500_000,
                    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
                    AVVideoAllowFrameReorderingKey: true,
                ],
            ]
        )
        writerInput.expectsMediaDataInRealTime = false
        writer.add(writerInput)

        guard reader.startReading(), writer.startWriting() else {
            failure = reader.error?.localizedDescription
                ?? writer.error?.localizedDescription
                ?? "could not start reading or writing"
            return
        }
        writer.startSession(atSourceTime: .zero)

        let queue = DispatchQueue(label: "prepare-video.encode")
        await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
            writerInput.requestMediaDataWhenReady(on: queue) {
                while writerInput.isReadyForMoreMediaData {
                    guard let buffer = readerOutput.copyNextSampleBuffer() else {
                        writerInput.markAsFinished()
                        continuation.resume()
                        return
                    }
                    writerInput.append(buffer)
                }
            }
        }

        await writer.finishWriting()
        if writer.status == .failed {
            failure = writer.error?.localizedDescription ?? "write failed"
            return
        }
    } catch {
        failure = error.localizedDescription
    }
}

semaphore.wait()

if let failure {
    FileHandle.standardError.write(Data("FAILED \(inputURL.lastPathComponent): \(failure)\n".utf8))
    exit(1)
}

let bytes = (try? FileManager.default.attributesOfItem(atPath: outputURL.path)[.size] as? Int) ?? 0
print("\(outputURL.lastPathComponent)  \(Int(targetW))x\(Int(targetH))  \((bytes ?? 0) / 1024) KB")
