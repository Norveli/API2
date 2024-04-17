const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes')
const cookieParser = require ('cookie-parser')
const {checkUser} = require ('./middleware/authMiddleware');
const Recipe = require('./models/Recipe');



const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json())
app.use(cookieParser())

// view engine
app.set('view engine', 'ejs');

// // database connection
const dbURI = 'mongodb+srv://elnorvaisas:4jU6GpcUABiahcJZ@cluster0.r46yfcg.mongodb.net/node2';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        app.listen(3001);
        console.log('Connected to MongoDB');
    })
    .catch(err => console.log(err));

// routes
app.get('*', checkUser)
app.get('/', (req, res) => res.render('home'));

app.use(authRoutes)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.get('/recipeDetail/:id/editRecipe',  async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }
        res.render('editRecipe', { recipe: recipe });
    } catch (error) {
        res.status(500).send(error.toString());
    }
});


app.post('/recipes/:id/edit', async (req, res) => {
    try {
        const { name, ingredients, instructions } = req.body;
        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, {
            name,
            ingredients: ingredients.split(',').map(ingredient => ingredient.trim()), 
            instructions
        }, { new: true });

        res.redirect('/recipes/' + updatedRecipe._id);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});





