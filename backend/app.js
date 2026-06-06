const dotenv = require('dotenv');
const express=require('express')
const connectDb =require('./config/db.config')
const helmet = require('helmet');
const { generalLimiter, authLimiter } = require('./middlewares/rate.limiter.middleware');


dotenv.config();
const port =process.env.PORT;
const app = express();
//app.set('trust proxy', 1); // Trust the first hop proxy to forward correct client IPs

app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Allows your app to load images from self and Cloudinary
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      },
    },
  }));

  app.use(require('./middlewares/cors.middleware'))
  app.use(generalLimiter);


app.use(express.json());
connectDb();


app.use('/login',require('./routes/auth.route'));
app.use('/user',require('./routes/user.route'));
app.use('/product',require('./routes/product.route'));
app.use('/cart',require('./routes/cart.route'))
app.use('/order',require('./routes/order.route'))
app.use('/faq',require('./routes/faq.route'))
app.use('/testimonials',require('./routes/testimonials.route'))
app.use('/category',require('./routes/category.route'))
app.use('/subcategory',require('./routes/subcategory.route'))
app.use('/payment',require('./routes/payment.route'))






app.listen(port,_=>console.log(`server listening to port: ${port}`))