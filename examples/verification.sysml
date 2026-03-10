package VerificationExample {
    requirement def PerformanceReq {
        doc /* The system shall respond within 100ms. */
        attribute responseTime : Real;
        require constraint responseTimeLimit {
            responseTime <= 100;
        }
    }

    requirement def SafetyReq {
        doc /* The system shall not cause harm. */
    }

    part def System;
    part def TestRig;

    verification def PerformanceTest {
        subject testRig : TestRig;

        action measureResponse;
        action evaluateResults;

        first measureResponse then evaluateResults;
    }

    verification perfTest : PerformanceTest;

    satisfy PerformanceReq by System;
}
