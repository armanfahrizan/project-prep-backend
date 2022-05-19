const multer = require('multer')

// define storage(memorystorage or diskstorage)
const profileStorage = multer.diskStorage({
    //memiliki 2 properti yaitu destination dan filename, yang keduanya berbentuk function
    destination : function (req, file, cb) {
        //callback memiliki 2 paramater, yaitu error dan file destination
        cb(null, './public/profiles')
    },
    //filename berfungsi sebagai mengganti nama file
    filename : function (req, file, cb) {
        cb(null, `IMG-` + Date.now() + `.jpg`)
    }
})

const postStorage = multer.diskStorage({
    //memiliki 2 properti yaitu destination dan filename, yang keduanya berbentuk function
    destination : function (req, file, cb) {
        //callback memiliki 2 paramater, yaitu error dan file destination
        cb(null, './public/posts')
    },
    //filename berfungsi sebagai mengganti nama file
    filename : function (req, file, cb) {
        cb(null, `IMG-` + Date.now() + `.jpg`)
    }
})

const avaStorage = multer.diskStorage({
    //memiliki 2 properti yaitu destination dan filename, yang keduanya berbentuk function
    destination : function (req, file, cb) {
        //callback memiliki 2 paramater, yaitu error dan file destination
        cb(null, './public/avatars')
    },
    //filename berfungsi sebagai mengganti nama file
    filename : function (req, file, cb) {
        cb(null, `IMG-` + Date.now() + `.jpg`)
    }
})


const profilePict = multer ({storage: profileStorage, limits : 1000000})
const postPict = multer ({storage: postStorage, limits : 1000000})
const avaPict = multer({storage: avaStorage, limits : 1000000})

module.exports = {profilePict, postPict, avaPict}

// module.exports = multer ({storage: storageProfile, limits: 1000000})