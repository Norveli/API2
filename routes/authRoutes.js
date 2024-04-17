const {Router} = require ('express')
const authController = require ('../controllers/authController')




const router = Router()

router.get('/signup', authController.signup_get)
router.post('/signup', authController.signup_post)
router.get('/login', authController.login_get)
router.post('/login', authController.login_post)
router.get('/logout', authController.logout_get)

router.get('/recipes', authController.show_recipes)

router.get('/recipes/new', authController.new_recipe_get)
router.post('/recipes', authController.new_recipe_post)

router.get('/recipes/:id', authController.select_recipe)

// router.get('/recipeDetail/:id/editRecipe', authController.edit_recipe_get)
// router.post('/recipes/:id/edit', authController.edit_recipe_post)

router.delete('/recipes/:id/delete', authController.delete_recipe)

module.exports = router