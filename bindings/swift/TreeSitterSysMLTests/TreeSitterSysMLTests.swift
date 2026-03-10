import XCTest
import SwiftTreeSitter
import TreeSitterSysML

final class TreeSitterSysMLTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_sysml())
        XCTAssertNoThrow(try parser.setLanguage(language))
    }
}
