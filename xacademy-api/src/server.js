import {env} from './config/env.js'
import {connectDB} from './db/connection.js'
import app from './app.js'
import logger from './config/winston.js'

const initServer = async ()=> {
    try{
        await connectDB()
        app.listen (env.PORT, ()=>{
            console.log(`Servidor escuchando el puerto ${env.PORT}`)
        })

    }
    catch (error){
        logger.error(error)
        process.exit(1)
    }
}

initServer()