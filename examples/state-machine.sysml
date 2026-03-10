package TrafficLight {
    state def TrafficLightStates {
        entry; then green;

        state green {
            entry action { /* turn on green */ }
        }
        transition green_to_yellow
            first green
            then yellow;

        state yellow {
            entry action { /* turn on yellow */ }
        }
        transition yellow_to_red
            first yellow
            then red;

        state red {
            entry action { /* turn on red */ }
        }
        transition red_to_green
            first red
            then green;
    }
}
