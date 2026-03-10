// INVALID: subject statement only valid in requirement/use case
// EXPECTED: Should fail - but currently passes due to TD-1
// TRACKING: Will become regression test when TD-1 is fixed
package Test {
    action def DoSomething {
        subject mySubject : Vehicle;
    }
}
