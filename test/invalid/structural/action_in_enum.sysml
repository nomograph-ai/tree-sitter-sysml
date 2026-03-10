// INVALID: action usage inside enumeration body (structural mismatch)
// EXPECTED: Parse error (currently may over-accept due to TD-1)
enum def Color {
    action doSomething;
}
