const express = require('express')
const router = express.Router()
const myUserController = require('../controllers/myUserController')
const {jwtCheck, jwtParse} = require('../middleware/auth')
const { validateMyUserRequest } = require('../middleware/validation')

router.get('/', jwtCheck, jwtParse, myUserController.getCurrentUser)
router.post('/', jwtCheck, myUserController.createCurrentUser)
router.put('/', jwtCheck, jwtParse, validateMyUserRequest, myUserController.updateCurrentUser)

module.exports = router