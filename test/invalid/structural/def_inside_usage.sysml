// INVALID: definition inside a usage body (only usages belong here)
// EXPECTED: Parse error (currently may over-accept due to TD-1)
part vehicle : Vehicle {
    part def Engine { }
}
