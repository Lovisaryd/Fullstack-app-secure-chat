import express from 'express'
import * as url from 'url'
import {chatChannels, users, addChannel,deleteChannel, foundUser, addNewUser, authenticateUser, createToken, automaticLogin, sendNewMessage} from './database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

const app = express()
const staticPath = url.fileURLToPath(new URL('../static', import.meta.url))
const publicPath = url.fileURLToPath(new URL('../public', import.meta.url))

const salt = bcrypt.genSaltSync(10);

dotenv.config()

app.use(express.json())
app.use(express.static(staticPath))
app.use(express.static(publicPath))

app.post('/login', (req, res)=> {
    const {name, password} = req.body
    console.log("Trying to log in")
    if(authenticateUser(name, password)){
        console.log("Logged in!")
        const userToken = createToken(name)
        res.status(200).send(userToken)
    } else {
        res.sendStatus(401)
        return
    }
})

app.post('/register', (req, res)=>{
    const {name, password} = req.body
    if(foundUser(name)){
        console.log("User already exist")
        res.status(400).send("A user with that name already exist")
    } else {
        let hashedPassword = bcrypt.hashSync(password, salt)
        addNewUser({name, password: hashedPassword})
        res.status(201).send("Registered user.")
        console.log("New user registered!")
    }
})


app.get('/', (req, res)=>{
    res.sendFile(staticPath + '/index.html')
})

app.get('/api/channels', (req, res)=> {
    res.status(200).send(chatChannels)
})

app.get('/api/channels/:id', (req, res)=>{
    const id= +req.params.id
    const i = chatChannels.findIndex((i) => i.id === id)
    if(i >= 0){
        res.status(200).send(chatChannels[i])
    } else {
        res.status(400).send("No messages")
    }
   
})

app.get('/api/channels/:id/messages', (req,res)=>{
    const id = +req.params.id
    const i = chatChannels.findIndex((i) => i.id === id)
    if(i >= 0){
        res.status(200).send(chatChannels[i].messages)
    } else {
        res.status(400).send("No messages")
    }
})

app.post('/api/channels', (req, res)=> {
    if(req.body.title && req.body.status){
    const {newChannel} = req.body;
    let title = req.body.title;
    let status = req.body.status;
    let maxId = Math.max(0,...chatChannels.map(object => object.id))
    let id = maxId + 1;
    let messages = [];
    addChannel({id, title, status, newChannel, messages})
    console.log("channel added")
    res.status(201).send("New channel added.")
} else {
    res.status(400).send("Bad request")
}
})

app.delete('/api/channels/:id', (req, res)=> {
    let id = +req.params.id;
    let i = chatChannels.findIndex((i)=> i.id === id);
    if(i >= 0){
        deleteChannel( i)
        res.status(202).send("Channel deleted!")
    } else {
        res.status(400).send("Bad request")
    }
    
})

app.post('/secret', (req, res)=> {
    let token = req.body.token || req.query.token
    if(!token){
        let x = req.headers['authorization']
        if(x=== undefined){
            res.sendStatus(401)
            return
        }
        token = x.substring(7)
    }
    if(token){
        let decoded
    try {
        decoded = jwt.verify(token, process.env.SECRET)
    } catch(error){
        res.sendStatus(401)
        return
    }
    let name = decoded.name
    const userLoggedIn = foundUser(name)
    if(userLoggedIn === true){
    res.status(200).send(name)
}
    }
})

/*app.delete('/api/channels/:id/messages/:order', (req, res)=>{
    let id = +req.params.id;
    let i = chatChannels.findIndex((i)=> i.id === id);
    let order = +req.params.order
    let message = chatChannels[i].messages
    let msgId = message.findIndex((msgId) => msgId.order === order)
  
    if(i && msgId >= 0){
        deleteMessage(i, msgId)
        res.status(202).send("Message deleted!")
    } else {
        res.status(400).send("Bad request")
    }

})*/

app.post('/api/channels/:id/messages', (req, res)=> {
    let token = req.body.token || req.query.token
    let id= +req.params.id
    let time = req.body.time
    const message = req.body.message
    const {newMessage} = req.body 
    let i = chatChannels.findIndex((i)=> i.id === id)
    let currentChannel = chatChannels[i].messages
    let maxOrder = Math.max(0,...currentChannel.map(object => object.order))
    let order = maxOrder + 1
   
    if(i >= 0){
        let x = req.headers['authorization']
        if(x === undefined){
            res.sendStatus(401)
            return
        }
        token = x.substring(7)
    if(token){
        let decoded
        try{
            decoded = jwt.verify(token, process.env.SECRET)
        } catch(errror){
            res.sendStatus(401)
            return
        }
        let name = decoded.name
        if(req.body.message != ""){
            const sentBy = name
            sendNewMessage({order, i, time, sentBy, newMessage, message})
            res.status(201).send("Message added!")
        }
    }
}})

app.get('/api/users', (req, res)=> {
    res.status(200).send(users)
})

app.get('/api/users/:id', (req, res) => {
    let id = +req.params.id
    let i = users.findIndex((i)=> i.id === id)
    if(i >= 0){
        res.status(200).send(users[i])
    } else {
        res.status(404).send("User not found")
    }
})

app.post('/api/inlogged', (req, res)=> {
    let token = req.body.token || req.query.token
    if(!token){
        let x = req.headers['authorization']
        if(x === undefined){
            res.sendStatus(401)
            return
        }
        token = x.substring(7)
    if(token){
        let decoded
        try{
            decoded = jwt.verify(token, process.env.SECRET)
        } catch(errror){
            res.sendStatus(401)
            return
        }
        let name = JSON.stringify(decoded.name)
    
        res.status(201).send(name)
    }
}
})

export {app}