package Vehicle {
    import ISQ::MassValue;
    import ISQ::PowerValue;

    part def Engine {
        attribute mass : MassValue;
        attribute power : PowerValue;
    }

    part def Transmission {
        attribute gearRatios : Real[1..*] ordered;
    }

    part def Vehicle {
        part engine : Engine;
        part transmission : Transmission;

        connect engine to transmission;

        attribute totalMass : MassValue;

        constraint massConstraint {
            totalMass >= engine.mass
        }
    }

    part sportsCar : Vehicle {
        part engine : Engine {
            :>> mass = 150 [kg];
            :>> power = 300 [kW];
        }
    }
}
