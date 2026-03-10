// INVALID: Missing semicolon after usage
// EXPECTED: Parse error
package Test {
    part def Foo { }
    part x : Foo
}
