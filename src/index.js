const express = require('express')
//import dotenv untuk membaca env
const dotenv = require('dotenv')
dotenv.config()

const cors = require('cors')

//import database
const database = require('./config')

//initialize express app
const app = express()

//config middleware
app.use(express.json())

app.use(cors({exposedHeaders: ['UID', 'authToken']}))

//open access to folder public
app.use(express.static('public'))

//test database
database.connect((error) => {
    if(error){
        console.log(`errorDatabase:`, error);
    }
    console.log(`Database at MySQL is connected, threadId: ${database.threadId}`);
})

//define home route
app.get('/', (req, resp) => resp.status(200).send(`<h1>This is my REST API</h1>`))

//define routes
const routers = require('./routers')
const req = require('express/lib/request')
app.use('/api', routers.userRouter)
app.use('/api', routers.postRouter)
app.use('/api', routers.uploaderRouter)

//binding app into localhost
const PORT = process.env.PORT
app.listen(PORT, () => console.log(`API running at port ${PORT}`))