const channelMenu = document.querySelector(".channels")
const messageList = document.querySelector(".messageList")
const addChannel = document.querySelector("#addChannel")
const loginForm = document.querySelector("#log-in");
const usernameInput = document.querySelector("#username")
const passwordInput = document.querySelector("#password")
const signInBtn = document.querySelector("#login")
const signUpBtn = document.querySelector("#register")
const logoutForm = document.querySelector("#log-out")
const messageForm = document.querySelector("#message-form");
const sendMessage = document.querySelector("#sendMessage")
const messageInput = document.querySelector("#message")
const fadeBackground = document.querySelector(".fade-background")
const createChannel = document.querySelector(".create-channel")
const header = document.querySelector("#header")
const header2 = document.querySelector("#header2")
const input = document.querySelector("#newChannel")
const input2 = document.querySelector("#privateCheck")
const label = document.querySelector("#label")
const submitbtn = document.querySelector("#submitChannel")
const close = document.querySelector("#close")
const editStuff = document.querySelector(".edit-stuff")
const loggedIn = document.querySelector("#logged-in")

getChannels()

const JWT_KEY = 'securechat-jwt'
let isLoggedIn = false;
const SELECTED_KEY = 'selected-channel'

checkLoggedIn()


async function getChannels() {
    const response = await fetch('/api/channels')
    const channels = await response.json()

    channels.forEach((element, i) => {
        const channelName = document.createElement("li")
        const title = document.createElement("h4")
        const hashlock = document.createElement("img")
        hashlock.src = "lockhash.svg"
        hashlock.className = "lock-hash"
        const hash = document.createElement("img")
        hash.src = "hash.svg"
        hash.className ="lock-hash"
        
        channelMenu.appendChild(channelName)
        channelName.appendChild(title)

        if(channels[i].status === "private"){
            title.textContent = `${channels[i].title}`
            channelName.appendChild(hashlock)
            
        } else {
            title.textContent = ` ${channels[i].title}`
            channelName.appendChild(hash)
            
        }


        title.addEventListener('click', async () => {
            if(!isLoggedIn && channels[i].status === "private"){
                title.removeEventListener
            }else {
            messageList.innerHTML = "";
            const response = await fetch('/api/channels/' + channels[i].id)
            const messageObject = await response.json()
            const realMessage = messageObject.messages
            sessionStorage.setItem(SELECTED_KEY, channels[i].id)

            realMessage.forEach((element, i)=> {
                
                const name = realMessage[i].sentBy
                let time = realMessage[i].time
                const bg = document.createElement("div")
                const messageText = document.createElement("p")
                bg.className = "message-text"
                messageText.className = "message"
                const timeSent = document.createElement("p")
                timeSent.className = "time"
                timeSent.innerText = `${time}`

                messageText.innerText = `${name}: ${realMessage[i].message}`
                messageList.appendChild(bg)
                bg.appendChild(timeSent)
                bg.appendChild(messageText)

            }) 
            if(messageList.innerHTML === ""){
                const emptyChannel = document.createElement("h1")
                const paragraph = document.createElement("p")
                paragraph.textContent = "Be first to send a message."
                emptyChannel.textContent = `Welcome to ${channels[i].title}`
                emptyChannel.className = "empty-channel"
                paragraph.className = "empty-channel"
                messageList.appendChild(emptyChannel)
                messageList.appendChild(paragraph)
            }}

        })

    });

}

sendMessage.addEventListener('click', async () =>{
    let d = new Date()
    let day = whatDayIsIt()
    let minutes = d.getMinutes()
    if (minutes < 10) {
        minutes = "0" + minutes
      };
    let dayHourMin = day + " " + d.getHours() + ":" + minutes
    let time = dayHourMin.toString()
    const token = sessionStorage.getItem(JWT_KEY)

    const message = {
        time: time,
        message: messageInput.value
    }
    const options = {
        method: 'POST',
        body: JSON.stringify(message), token,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer "+ token
        }
    }
    let id = sessionStorage.getItem(SELECTED_KEY)
    const response = await fetch('/api/channels/' + id+ '/messages', options)
    if(response.status === 201){
        defaultPage()
    }
})

function whatDayIsIt(){
    let d = new Date()
    let day = d.getDay()
    switch(day){
        case 1:
            day = "Monday"
            break;
            case 2:
                day = "Tuesday"
            break;
            case 3:
                day = "Wednesday"
                break;
                case 4:
                    day = "Thursday"
                    break;
                    case 5:
                        day = "Friday"
                        break;
                        case 6:
                            day = "Saturday"
                            break;
                            case 7:
                                day = "Sunday"
                                break;
    }
    return day
}

signInBtn.addEventListener('click', async ()=> {
    const user = {
        name: usernameInput.value,
        password: passwordInput.value
    }
    const options = {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
            "Content-Type" : "application/json"
        }
    }

    const response = await fetch('/login', options)
    if(response.status === 200){
        console.log("Login sucessfull!")
        const userToken = await response.json()
        sessionStorage.setItem(JWT_KEY, userToken.token)
        isLoggedIn = true
        updateUi()
    } else {
        console.log("Login failed, status: "+ response.status )
    }
})

signUpBtn.addEventListener('click', async ()=>{
    const newUser = {
        name: usernameInput.value,
        password: passwordInput.value
    }
    const options = {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: {
            "Content-Type": "application/json"
        }
    }
    const response = await fetch('/register', options)
    if(response.status === 201){
        console.log("User created")
    } else {
        console.log("User not created")
    }

})

async function updateUi(isLoggedIn){

    logoutForm.style.display = "block";
    addChannel.style.display = "block";
    loginForm.style.display = "none";
    const logoutBtn = document.createElement("button")
    logoutBtn.id = "logout"
    logoutBtn.innerText ="Log out"
    logoutForm.appendChild(logoutBtn)

    const user = document.createElement("h4")
    const token = sessionStorage.getItem(JWT_KEY)
    const options = {
        method: 'POST',
        body: token,
        headers: {
            "Authorization" : "Bearer " + token
        }
    }
    const response = await fetch('/api/inlogged', options)
    const username = await response.json()
    user.textContent = `${username}`
    const userimg = document.createElement("i")
    userimg.className = "fa-solid fa-user"
    userimg.id = "user"
    loggedIn.appendChild(userimg)
    loggedIn.appendChild(user)
    defaultPage()
    

    logoutBtn.addEventListener('click', ()=>{
        sessionStorage.removeItem(JWT_KEY)
        window.location.reload()
    })
    
}

async function checkLoggedIn(){
    let token = sessionStorage.getItem(JWT_KEY)
    const options ={
        method: 'POST',
        body: token,
        headers: {
            "Authorization" : "Bearer " + token
        }
    }
    const response = await fetch('/secret', options)
    if (response.status === 200){
        isLoggedIn = true;
        updateUi()
    } else {
        defaultPage()
        return
    }
}

/*async function deleteMsg(id, order){
    const options = {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        }
    }
    const response = await fetch('/api/channels/'+ id + '/messages/' + order, options)
    if(response.status === 202){
        console.log("message deleted!")

    }
}*/

async function defaultPage(){
    if(!isLoggedIn){
            const response = await fetch('/api/channels')
            const channels = await response.json()
            const welcomePage = channels[0]
            const realMessage = welcomePage.messages

            realMessage.forEach((element, i)=> {
                const name = realMessage[i].sentBy
                let time = realMessage[i].time
                const bg = document.createElement("div")
                const messageText = document.createElement("p")
                bg.className = "message-text"
                messageText.className = "message"
                const timeSent = document.createElement("p")
                timeSent.className = "time"
                timeSent.innerText = `${time}`

                messageText.innerText = `${name}: ${realMessage[i].message}`
                messageList.appendChild(bg)
                bg.appendChild(timeSent)
                bg.appendChild(messageText)
    })
    if(messageList.innerHTML === ""){
        const emptyChannel = document.createElement("h1")
        const paragraph = document.createElement("p")
        paragraph.textContent = "Be first to send a message."
        emptyChannel.textContent = `Welcome to ${channels[0].title}`
        emptyChannel.className = "empty-channel"
        paragraph.className = "empty-channel"
        messageList.appendChild(emptyChannel)
        messageList.appendChild(paragraph)
    }} 
    if(isLoggedIn){
    messageList.innerHTML = ""
    let id = sessionStorage.getItem(SELECTED_KEY)
    const response = await fetch('/api/channels/'+ id)
    const currentChannel = await response.json()
    const channelMessages = currentChannel.messages


    channelMessages.forEach((element, i)=> {
                
        const name = channelMessages[i].sentBy
        let time = channelMessages[i].time
        const bg = document.createElement("div")
        const messageText = document.createElement("p")
        bg.className = "message-text"
        messageText.className = "message"
        const timeSent = document.createElement("p")
        timeSent.className = "time"
        timeSent.innerText = `${time}`

        

        messageText.innerText = `${name}: ${channelMessages[i].message}`
        messageList.appendChild(bg)
        bg.appendChild(timeSent)
        bg.appendChild(messageText)

    }) 
    }}

addChannel.addEventListener('click', async ()=> {
    fadeBackground.style.display = "block"

    close.addEventListener('click', ()=> {
        fadeBackground.style.display = "none"
    })
    

    if(input.value != undefined){
    submitbtn.addEventListener('click', async ()=> {
        if(input2.checked === true){
        const newChannel = {
            status: "private",
            title: input.value
        } 
        const options = {
            method: 'POST',
            body: JSON.stringify(newChannel),
            headers: {
                "Content-Type": "application/json"
            }
        }
        const response = await fetch('/api/channels', options)
        if(response.status === 201){
            console.log("Channel added.")
            fadeBackground.style.display = "none"
            window.location.reload()
        }
    } else {
        const newChannel = {
            status: "public",
            title: input.value
        } 
        const options = {
            method: 'POST',
            body: JSON.stringify(newChannel),
            headers: {
                "Content-Type": "application/json"
            }
        }
        const response = await fetch('/api/channels', options)
        if(response.status === 201){
            console.log("Channel added.")
            fadeBackground.style.display = "none"
            window.location.reload()
        }
    }
    })
}})