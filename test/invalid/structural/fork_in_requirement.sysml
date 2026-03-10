// INVALID: fork node only valid in action definitions/usages
// EXPECTED: Should fail - but currently passes due to TD-1
// TRACKING: Will become regression test when TD-1 is fixed
package Test {
    requirement def SafetyReq {
        fork forkNode;
    }
}
