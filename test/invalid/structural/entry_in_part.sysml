// INVALID: entry statement only valid in state definitions/usages
// EXPECTED: Should fail
// STATUS: Currently passes - 'entry' parsed as identifier, 'action' as separate usage
// TRACKING: Requires keyword reservation or entry-specific grammar rule
package Test {
    part def Vehicle {
        entry action startEngine;
    }
}
