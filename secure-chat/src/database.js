import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import * as dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'



const __dirname = dirname(fileURLToPath(import.meta.url))
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

await db.read()
dotenv.config()

db.data ||= {users: [], channels: []}

const users = db.data.users
const chatChannels = db.data.channels

async function addChannel ({id, title, status, newChannel, messages}){
    chatChannels.push({id, title, status, newChannel, messages})
    await db.write()
}

async function deleteChannel(i){
    chatChannels.splice(i, 1);
    await db.write()

}

/*async function deleteMessage(i, msgId){
    let currentChannel= chatChannels[i].messages
    currentChannel.splice(msgId,1)
    await db.write()
}*/


function foundUser(name){
	const found = users.find(users => users.name === name)
	return Boolean(found)
}

async function addNewUser({name, password:hashedPassword}){
    let maxid = Math.max(0,...users.map(object => object.id))
    let id = maxid + 1
	const newUser = {id, name, password: hashedPassword}
	users.push(newUser)
    await db.write()
}

async function sendNewMessage({order,i,time, sentBy, newMessage, message}){
    chatChannels[i].messages.push({order,sentBy, time, newMessage, message})
    await db.write()
}


function authenticateUser(name, password) {
	let match = users.find(users => users.name === name)
    let correctPassword = bcrypt.compareSync(password, match.password)
    if(match && correctPassword){
	return Boolean(match)
}
}

function createToken(name){
	const user = {name: name}
	const token = jwt.sign(user, process.env.SECRET)
	user.token = token
	return user
}

function automaticLogin(name){
    const found = users.find(users => users.name === name)
    if(found){
        return true
    }
}


export {chatChannels, users, addChannel, deleteChannel, foundUser, addNewUser, authenticateUser, createToken, automaticLogin, sendNewMessage}