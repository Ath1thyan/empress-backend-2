import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import dbConnection from './database/dbConnection.js';

/** Import routes */
import authRoute from './routes/authRoute.js';
import cabAdminRoute from './routes/cabAdminRoute.js';
import cabDriverRoute from './routes/cabDriverRoute.js';
import userRoute from './routes/userRoute.js';
import superAdminRoute from './routes/adminRoute.js'

/** Load environment variables */
dotenv.config();
const app = express();

/** middlewares */
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173', // Replace this with your frontend URL
    credentials: true, // Allow credentials such as cookies
}));

// Preflight request
app.options('*', cors({
    origin: 'http://localhost:5173', // Replace this with your frontend URL
    credentials: true,
}));


app.use(morgan('tiny'));
app.disable('x-powered-by'); // Removes all X-Powered-By headers.

const port = process.env.PORT || 8080;

/** HTTP GET Request */
app.get('/api', (req, res) => {
    res.status(201).json("API is Working!");
});

/** API Routes */
app.use('/api/test/auth', authRoute);
app.use('/api/test/cabadmin', cabAdminRoute);
app.use('/api/test/cab-driver', cabDriverRoute);
app.use('/api/test/user', userRoute);
app.use('/api/test/superadmin', superAdminRoute);

/** Start server only if having valid DB connection */
dbConnection()
    .then(() => {
        try {
            app.listen(port,
                () => console.log(`Server is running on port ${port}`)
            );
        } catch (error) {
            console.error("Error starting server:", error);
        }
    })
    .catch((error) => {
        console.error("Error connecting to database:", error);
    });
