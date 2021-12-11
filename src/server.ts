import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import Role from "./models/Role";
import Level from "./models/Level";

//  IMPORTING ROUTES
import userRoutes from "./routes/user.routes";

const app = express();
const port: string = process.env.PORT || "3000";


//MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(cors());
app.use(helmet());

//  ROUTERS
app.use('/api/', userRoutes);
app.get('/test', async (req, res) => {
    res.json({name: "Jorge Luis", lastName: "Saldivar Castillo"})
})

//INITIAL SETUP
const createRoles = async () => {
    try {
      // Count Documents
      const count = await Role.estimatedDocumentCount();
        //checking if roles already exist
        if(!count){
            // Create default Roles
            const values = await Promise.all([
                new Role({ name: "user" }).save(),
                new Role({ name: "moderator" }).save(),
                new Role({ name: "admin" }).save(),
            ]);
            console.log(values);
        } else { return; }
    } catch (error) {
      console.error(error);
    }
};

const createLevels = async () => {
    try {
      // Count Documents
      const count = await Level.estimatedDocumentCount();
        //checking if levels already exist
        if(!count){
            // Create default Levels
            const values = await Promise.all([
                new Level({ name: "junior" }).save(),
                new Level({ name: "medium" }).save(),
                new Level({ name: "senior" }).save(),
            ]);
            console.log(values);
        } else { return; }
    } catch (error) {
      console.error(error);
    }
};

//  CONNECTION
const connect = async () => {
    // calling the database
    mongoose.Promise = global.Promise;
    await mongoose.connect(process.env.MONGO_URI as string)
        .then(() => console.log(`DB is connected`))
        .catch((err) => console.log(err));
    //starting the server
    app.listen(port);
    console.log(`Listening on port ${port}`);
}

connect().then(() => {
    createRoles();
    createLevels();
})

