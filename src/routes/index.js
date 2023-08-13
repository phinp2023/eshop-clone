const userRouter = require('./user');

const route = (app) => {
    app.use('/api/v2/user', userRouter);
};

module.exports = route;
