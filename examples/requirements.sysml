package Requirements {
    requirement def MassRequirement {
        doc /* The system shall have a total mass below the specified limit. */

        subject system : Parts::Part;

        attribute massLimit : ISQ::MassValue;

        require constraint {
            system.mass <= massLimit
        }
    }

    requirement vehicleMassReq : MassRequirement {
        :>> massLimit = 2000 [kg];
    }

    requirement def PerformanceRequirement {
        doc /* The system shall meet the specified performance criteria. */

        attribute minSpeed : ISQ::SpeedValue;
        attribute maxAccelTime : ISQ::DurationValue;
    }

    requirement topSpeed : PerformanceRequirement {
        :>> minSpeed = 200 [km/h];
    }
}
