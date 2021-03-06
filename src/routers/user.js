const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')
const sharp = require('sharp')
const { sendWelcomeEmail, sendFinalEmail } = require('../emails/account')
const router = new express.Router()
require('../db/mongoose')

const multer = require('multer')
const upload = multer({
    // dest: 'images',
    limits: {
        fileSize: 1000000 //bytes
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpeg|jpg)$/)) { // /\.(doc|docx)$/
            return cb(new Error('File must be of word extension'))
        }
        cb(undefined, true)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const email = req.body.email, password = req.body.password
        const user = await User.findByCredentials(email, password)
        const token = await user.generateAuthToken()
        user.tokens = user.tokens.concat({ token })
        await user.save()

        res.send({ user, token})
    }
    catch(e) {
        res.status(400).send({
            errorMsg: 'Invalid password or email'
        })
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }
    catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    }
    catch (e) {
        res.status(500).send(e)
    }
})

// POST for saving info about users.
router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body)
        const token = await user.generateAuthToken()
        user.tokens = user.tokens.concat({ token })
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        res.status(201).send({user, token})
    }
    catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/me', auth, async (req, res) => {
    // Comes from middleware... req.user.
    res.send(req.user)
})

// update.
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password']
    
    // checks whether an updated field exists.
    const isValidOperation = updates.every((value) => {
        return allowedUpdates.includes(value)
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!'})
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }
    catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendFinalEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/me/avatar', auth, async (req, res) => {
    try {
        if (!req.user.avatar) {
            throw new Error('No avatar')
        }
        res.set('Content-Type', 'image/png')
        res.send(req.user.avatar)
    }
    catch (e) {
        res.status(400).send()
    }
})

router.get('/users/list', async(req, res) => {
    res.render('users')
})

module.exports = router