```javascript
    // USERS
    // autherUserId : integer
    // nameFirst: string
    // nameLast: string
    // email: string
    // password: string
    // createdQuizzes: array of integers
    
    // Quizes
    // quizId: integer
    // name: string
    // timeCreated: inter
    // timeLastEdited: integer
    // description: string

let data = {

    users : [
             {
                authUserId: 1
                nameFirst: 'Ijlal', 
                nameLast: 'idk',
                email: 'something@gmail.com',
                password: 'password',
                createdQuizzes: [quizId1, ...]
            }
    ],

    quizes : [
                {
                quizId: 1,
                name: 'My Quiz',
                timeCreated: 1683125870,
                timeLastEdited: 1683125871,
                description: 'quiz about me'
            }
    ],
}
```

[Optional] short description: 
object of objects 
Users have AuthUserId, nameFirst, nameLast, email, password & createdQuizzes
Quizes havee quizId, name, timeCreated, timelastedited & description.

        
