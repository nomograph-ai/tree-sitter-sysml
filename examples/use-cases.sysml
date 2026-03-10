package UseCaseExample {
    part def System;
    part def User;
    part def Database;

    use case def Login {
        subject system : System;
        actor user : User;

        objective loginObjective {
            doc /* The user shall be authenticated. */
        }

        include use case authenticate : Authenticate;
        include use case authorize : Authorize;
    }

    use case def Authenticate {
        subject system : System;
        actor user : User;

        require constraint validCredentials;
    }

    use case def Authorize {
        subject system : System;
        actor user : User;
    }

    use case login : Login;
}
