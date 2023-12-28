import express from "express"
import bcrypt from "bcryptjs"
import prisma from "./src/utils/prisma.js"
import cors from "cors"
import { signAccessToken } from "./src/utils/jwt.js"
import { filter } from "./src/utils/common.js"
import userRouter from "./src/controllers/users.controllers.js"
import authRouter from "./src/controllers/auth.controllers.js"
import imgRouter from "./src/controllers/img.controllers.js"
import morgan from "morgan"
import auth from "./src/middlewares/auth.js"
// import { Pool, neonConfig } from '@neondatabase/serverless'
// import { PrismaNeon } from '@prisma/adapter-neon'
import dotenv from 'dotenv'
// import ws from 'ws'

// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();


// dotenv.config()
// neonConfig.webSocketConstructor = ws
// const connectionString = `${process.env.DATABASE_URL}`

// const pool = new Pool({ connectionString })
// const adapter = new PrismaNeon(pool)



//////////////////////////////////////////////////////////////////
//send email
// import sgMail from "@sendgrid/mail"
// sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// const msg = {
//   to: 'pcf7b44972xxo@gmail.com', // Change to your recipient
//   from: 'koshijpn@gmail.com', // Change to your verified sender
//   subject: 'Thank you for Signing up!',
//   text: 'Thank you somuch!',
//   html: '<strong>this is a test</strong>',
// }

// sgMail
//   .send(msg)
//   .then((response) => {
//     console.log(response[0].statusCode)
//     console.log(response[0].headers)
//   })
//   .catch((error) => {
//     console.error(error)
//   })


/////////////////////////////////////////////////////////////////////////////


const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan('combined')) 
app.use(morgan(':method :url :status'));

app.use('/users', userRouter)
app.use('/auth', authRouter)
app.use('/img', imgRouter)

/////////////////////////////////////////////

function validateUser(input) {
  
  const validationErrors = {}

  if (!('name' in input) || input['name'].length == 0) {
    validationErrors['name'] = 'cannot be blank'
  }

  if (!('email' in input) || input['email'].length == 0) {
    validationErrors['email'] = 'cannot be blank'
  }

  if (!('password' in input) || input['password'].length == 0) {
    validationErrors['password'] = 'cannot be blank'
  }

  if ('password' in input && input['password'].length < 8) {
    validationErrors['password'] = 'should be at least 8 characters'
  }

  if ('email' in input && !input['email'].match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    validationErrors['email'] = 'is invalid'
  }

  return validationErrors
}

/////////////////////////////////////////////

function validateLogin(input) {
  const validationErrors = {}

  if (!('email' in input) || input['email'].length == 0) {
    validationErrors['email'] = 'cannot be blank'
  }

  if (!('password' in input) || input['password'].length == 0) {
    validationErrors['password'] = 'cannot be blank'
  }

  if ('email' in input && !input['email'].match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    validationErrors['email'] = 'is invalid'
  }

  return validationErrors
}

//////////////////////////////////////////////


/////////////////////////////////////////////

//gets all user
app.get('/', async (req, res) => {
  const allUsers = await prisma.user.findMany();
  res.json(allUsers);
});

///////////////////////////////////////////

// 特定のユーザーをIDで取得するエンドポイント
app.get('/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id); // パラメーターからIDを取得

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }, // id プロパティを追加
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



/////////////////////////////////////////////

//test
app.get('/protected', auth, (req, res) => {
  res.json({ "hello": "world" })
})
/////////////////////////////////////////////

//creates a new user
app.post('/users', async (req, res) => {
  const data = req.body

  const validationErrors = validateUser(data)

  if (Object.keys(validationErrors).length !== 0) {
    return res.status(400).send({
      error: validationErrors
    });
  }

  data.password = bcrypt.hashSync(data.password, 8);

  prisma.user.create({
    data
  })
    .then(user => {
      return res.json(filter(user, 'id', 'name', 'email'));
    })
    .catch(err => {
      // We have a unique index on the user's email field in our schema.
      // Postgres throws an error when we try to create 2 users with the same email.
      // Here's how we catch the error and gracefully return a friendly message to the user.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const formattedError = {};
        formattedError[`${err.meta.target[0]}`] = 'already taken';

        return res.status(500).send({
          error: formattedError
        });
      }
      throw err;
    });
});

///////////////////////////////////////////

app.post('/sign-in', async (req, res) => {
      const data = req.body
    
      const validationErrors = validateLogin(data)
    
      if (Object.keys(validationErrors).length != 0) return res.status(400).send({
        error: validationErrors
      })
    
      const user = await prisma.user.findUnique({
        where: {
          email: data.email
        }
      })
    
      if (!user) return res.status(401).send({
        error: 'user problem'
      })
    
      const checkPassword = bcrypt.compareSync(data.password, user.password)
      if (!checkPassword) return res.status(401).send({
        error: 'Email address or password not valid'
      })
    
      const userFiltered = filter(user, 'id', 'name', 'email')
      const accessToken = await signAccessToken(userFiltered)
      // Return user information along with the access token
      return res.json({ user: userFiltered, accessToken });
    })

/////////////////////////////////////////////
    
app.put('/user/:id', async (req, res) => {
    const { id } = req.body
    const { name, email, password } = req.body
    const post = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        password, 
      },
    })
    res.json(post)
  })

/////////////////////////////////////////////

app.delete(`/delete-user/:id`, async (req, res) => {
    const { id } = req.body
    const post = await prisma.user.delete({
      where: {
        id: Number(id),
      },
    })
    res.json(post)

    
})

/////////////////////////////////////////////


export default app