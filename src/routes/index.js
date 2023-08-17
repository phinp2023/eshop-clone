const userRouter = require('./user');
const shopRouter = require('./shop');
const categoryRouter = require('./category');
const productRouter = require('./product');

const route = (app) => {
    app.use('/api/v2/user', userRouter);
    app.use('/api/v2/shop', shopRouter);
    app.use('/api/v2/category', categoryRouter);
    app.use('/api/v2/product', productRouter);
};

module.exports = route;
