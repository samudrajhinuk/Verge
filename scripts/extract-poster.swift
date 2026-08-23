// extract-poster — pulls the first usable frame out of a prepared clip and
// writes it as a JPEG, for use as the <video poster>.
//
// The poster is what a visitor sees before the clip loads, when autoplay is
// blocked (iOS low-power mode), and when `preload="none"` defers the video. It
// has to match the first frame or the swap is visible.
//
// Build:  swiftc -O scripts/extract-poster.swift -o scripts/extract-poster
// Run:    scripts/extract-poster <in.mp4> <out.jpg> <maxEdge>

import AVFoundation
import AppKit
import Foundation

let args = CommandLine.arguments
guard args.count == 4, let maxEdge = Double(args[3]) else {
    FileHandle.standardError.write(Data("usage: extract-poster <in> <out> <maxEdge>\n".utf8))
    exit(1)
}

let inputURL = URL(fileURLWithPath: args[1])
let outputURL = URL(fileURLWithPath: args[2])

let asset = AVURLAsset(url: inputURL)
let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.maximumSize = CGSize(width: maxEdge, height: maxEdge)
// Without this the generator may return a keyframe some distance away, which
// would not match the frame the video actually starts on.
generator.requestedTimeToleranceBefore = .zero
generator.requestedTimeToleranceAfter = CMTime(seconds: 0.1, preferredTimescale: 600)

do {
    let cgImage = try generator.copyCGImage(at: .zero, actualTime: nil)
    let rep = NSBitmapImageRep(cgImage: cgImage)
    guard let data = rep.representation(
        using: .jpeg,
        properties: [.compressionFactor: 0.72]
    ) else {
        FileHandle.standardError.write(Data("could not encode jpeg\n".utf8))
        exit(1)
    }
    try data.write(to: outputURL)
    print("\(outputURL.lastPathComponent)  \(rep.pixelsWide)x\(rep.pixelsHigh)  \(data.count / 1024) KB")
} catch {
    FileHandle.standardError.write(Data("FAILED \(inputURL.lastPathComponent): \(error.localizedDescription)\n".utf8))
    exit(1)
}
