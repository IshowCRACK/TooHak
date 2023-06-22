```javascript
/*
    Users
        authUserId: integer
        nameFirst: string
        nameLast: string
        email: string
        password: string
        numSuccessLogins: integer
        numFailedPasswordsSinceLastLogin: integer
        failNow: integer
    
    Quizzes
        quizId: integer
        adminQuizId: integer
        name: string
        timeCreated: inter
        timeLastEdited: integer
        description: string
*/

let data = {
    users: 
        [
            {
                authUserId: 1
                nameFirst: 'Ijlal', 
                nameLast: 'idk',
                email: 'something@gmail.com',
                password: 'password',
                numSuccessLogins: 1,
                numFailedPasswordsSinceLastLogin: 0,
                failNow: 0
            }
        ],

    quizzes: 
        [
            {
                quizId: 1,
                adminQuizId: 1,
                name: 'My Quiz',
                timeCreated: 1683125870,
                timeLastEdited: 1683125871,
                description: 'quiz about me'
            }
        ]
}
```
        
