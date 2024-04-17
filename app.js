const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes')
const cookieParser = require ('cookie-parser')
const {requireAuth, checkUser} = require ('./middleware/authMiddleware');
const Recipe = require('./models/Recipe');
const User = require('./models/User');


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

app.get('/recipes',  requireAuth, async (req, res) => {
    try {
        const recipes = await Recipe.find(); 
        res.render('recipes', { recipes: recipes }); 
    } catch (error) {
        res.status(500).render('error', { error: error });
    }
})


app.get('/recipes/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id); 
        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }
        res.render('recipeDetail', { recipe: recipe }); 
    } catch (error) {
        res.status(500).render('error', { error: error });
    }
})

app.get('/recipeDetail/:id/editRecipe', requireAuth, async (req, res) => {
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

app.delete('/recipes/:id/delete', requireAuth, async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        console.log('Recipe deleted successfully');
        res.json({ success: true, message: 'Recipe deleted successfully!' });
    } catch (error) {
        console.error('Failed to delete the recipe:', error);
        res.status(500).json({ success: false, message: 'Failed to delete the recipe.' });
    }
});



