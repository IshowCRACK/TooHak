```javascript
    // USERS
    // autherUserId : integer
    // nameFirst: string
    // nameLast: string
    // email: string
    // password: string
    // createdQuizzes: array of integers
    // numSuccessLogins: integer,
    // numFailedPasswordsSinceLastLogin: integer,
    
    // Quizes
    // quizId: integer
    // adminQuizId: integer
    // name: string
    // timeCreated: inter
    // timeLastEdited: integer
    // description: string

    // users & quizes are no longer arrays of objects and now are only 
    // arrays, since it was causing problems storing data initally.


let data = {
    
    users : [
                authUserId: 1
                nameFirst: 'Ijlal', 
                nameLast: 'idk',
                email: 'something@gmail.com',
                password: 'password',
                numSuccessLogins: 1,
		        numFailedPasswordsSinceLastLogin: 0,
    ],

    quizes : [
                quizId: 1,
                adminQuizId: 1,
                name: 'My Quiz',
                timeCreated: 1683125870,
                timeLastEdited: 1683125871,
                description: 'quiz about me'
    ],
}
```

[Optional] short description: 
object of objects 
Users have AuthUserId, nameFirst, nameLast, email, password & createdQuizzes
Quizes havee quizId, name, timeCreated, timelastedited & description.

        
