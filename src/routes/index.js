const userRouter = require('./user');
const shopRouter = require('./shop');

const route = (app) => {
    app.use('/api/v2/user', userRouter);
    app.use('/api/v2/shop', shopRouter);
};

module.exports = route;
