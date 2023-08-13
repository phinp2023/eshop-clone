const multer = require('multer');
const path = require('path');

// process.cwd(): returns the current working directory
// _dirname: returns the directory name of the directory containing the JavaScript source code file

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), 'src', 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = file.originalname.split('.')[0];
        cb(null, filename + '-' + uniqueSuffix + '.png');
    },
});

exports.upload = multer({ storage: storage });
