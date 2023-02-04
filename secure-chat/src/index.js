import {app} from './server.js'
import * as dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT

app.listen(PORT, ()=>{
    console.log('Server is listening...')
})