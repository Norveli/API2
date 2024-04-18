const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    ingredients: {
        type: [String],
        required: true
    },
    instructions: {
        type: String
    }
    
})

const Recipe = mongoose.model('Recipe', recipeSchema)

module.exports = Recipe
