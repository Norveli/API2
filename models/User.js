const mongoose = require ('mongoose')
const {isEmail} = require ('validator')
const bcrypt = require ('bcrypt')

const passwordComplexity = function(value) {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).*$/.test(value)
}
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
        
    },
    email: {
        type: String,
        required: [true, 'please enter an email'],
        unique: true,
        lowercase: true, 
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'please enter password'],
        minlength: [6, 'Password minimum length is 6 characters'],
        validate: [passwordComplexity, 'Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character']
    }

})

userSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

userSchema.statics.login = async function (username, password) {
    const user = await this.findOne({username})
    if(user){
        const auth = await bcrypt.compare(password, user.password)
        if(auth){
            return user
        }
        throw Error('Incorrect username or password')
    }
    throw Error('Incorrect username or password')
}

const User = mongoose.model('user', userSchema)
module.exports = User