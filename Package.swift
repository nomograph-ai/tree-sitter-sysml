// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterSysML",
    products: [
        .library(name: "TreeSitterSysML", targets: ["TreeSitterSysML"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.9.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterSysML",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterSysMLTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterSysML",
            ],
            path: "bindings/swift/TreeSitterSysMLTests"
        )
    ],
    cLanguageStandard: .c11
)
