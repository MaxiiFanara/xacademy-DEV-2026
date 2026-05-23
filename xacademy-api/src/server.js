import {env} from './config/env.js'
import {connectDB} from './db/connection.js'
import app from './app.js'

const initServer = async ()=> {
    try{
        await connectDB()
        app.listen (env.PORT, ()=>{
            console.info(`Servidor escuchando el puerto ${env.PORT}`)
        })

    }
    catch (error){
        console.error('Error al iniciar el servidor:', error)
        process.exit(1)
    }
}

initServer()