const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlegnth: 50
    },
    email: {
        type: String,
        trim: true, //빈 공간을 없애줌
        unique: 1 //중복값 잡기
    },
    password: {
        type: String,
        maxlength: 50
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: { // 관리자=1, 일반회원=0 구분
        type: Number,
        default: 0
    },
    image: String,

    token: { //유효성
        type: String
    },
    tokenExp: { //유효기간
        type: Number
    }

})

userSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
        // 비밀번호를 암호화 시킴
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err)

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }

})

userSchema.methods.comparePassword = function (plainPassword, cb) {

    // plainPassword test1 암호화된 비밀번호 :$2b$10$CjD4HacGjL7MI0Z9FaYi4.3klZ8QScfp5s0ztDmFvyj3AD84B2uZa
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err),
        cb(null, isMatch)
    })
}

userSchema.methods.generteToken = function(cb){
    // jsonwebtoken을 이용해서 토큰 생성

    var user =this;

    var token = jwt.sign(user._id, 'secretToken')

    // user._id +'secretToken' = token
    // ->
    // 'secretToken' -> user._id

    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err)
        cb(null, user)
    })
}


const User = mongoose.model('User', userSchema)

module.exports = { User }