import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import indexRoutes from './routes/index.js';

const app = express ()

app.use(express.json())
app.use (express.urlencoded({extended:true }))
app.use(helmet())
app.use(compression({
    brotli: { enabled: true, zlib: {} }
}))

app.use('/api', indexRoutes);

export default app