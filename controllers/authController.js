const User = require ('../models/User')
const jwt = require('jsonwebtoken')
const Recipe = require('../models/Recipe')
const authRoutes = require('../routes/authRoutes')
const {requireAuth} = require ('../middleware/authMiddleware');

const maxAge = 3 * 24 * 60 * 60
const createToken = (id) => {
    return jwt.sign({id}, 'slaptas dalykas',{
    expiresIn: maxAge
})
}

const handleErrors = (err) =>{
    let errors = {email:'', password:''}
    if(err.code=== 11000) {
        errors.email = 'That email is already registered'
        return errors
    }

    if (err.message === 'Incorrect email') {
    errors.email = 'That email is not registered'
}
    if (err.message === 'Incorrect password') {
        errors.password = 'That password is incorrect'
    }
    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message 
        })
    }
    return errors
}

module.exports.signup_get = (req,res) => {
    res.render('signup')
}

module.exports.login_get = (req,res) => {
    res.render('login')
}

module.exports.signup_post = async (req,res) => {
    const {email, username, password} = req.body
    try {
        const user = await User.create({email, username, password})
        const token = createToken(user._id)
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000})
        res.status(201).json({user: user._id})
    } catch (err){
        const errors = handleErrors(err)
        res.status(400).json({errors})
    } 
}

module.exports.login_post = async (req,res) => {
    const {username, password} = req.body
    try {
        const user = await User.login(username, password)
        const token = createToken(user._id)
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000})
        res.status(200).json({user: user._id})
    } catch (err){
        const errors = handleErrors(err)
        res.status(400).json({errors})
    } 
}

module.exports.show_recipes = requireAuth, async (req,res) => {
    try {
        const recipes = await Recipe.find(); 
        res.render('recipes', { recipes: recipes }); 
    } catch (error) {
        res.status(500).render('error', { error: error });
    }
}



module.exports.new_recipe_get = async (req, res) => {
    res.render('new-recipe'); 
}


module.exports.new_recipe_post = async (req, res) => {
    
    const { name, ingredients, instructions } = req.body;
    try {
        const recipe = await Recipe.create({ name, ingredients, instructions});
        res.status(201).json({ recipe: recipe._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};


module.exports.edit_recipe_get = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }
        res.render('editRecipe', { recipe: recipe });
    } catch (error) {
        res.status(500).send(error.toString());
    }
}

module.exports.edit_recipe_post = async (req, res) => {
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
}

module.exports.delete_recipe_post = async (req, res) => {
    try {
        const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, creator: req.user._id });
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found or user unauthorized' });
        }
        res.redirect('/recipes');
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports.logout_get = async (req, res) => {
    res.cookie('jwt','', {maxAge:1})
    res.redirect('/')
}