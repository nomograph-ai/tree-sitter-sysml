// INVALID: transition statement only valid in state definitions/usages
// EXPECTED: Should fail
// STATUS: Currently passes - succession_statement in structural_body matches pattern
// TRACKING: Requires separate transition rule or more restrictive succession
package Test {
    port def DataPort {
        transition t first s1 then s2;
    }
}
