const express = require('express');
const connectDb = require('./config/db');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const Product = require('./models/Product');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const cartRoutes = require('./routes/cart.routes');
const authenticateUser = require('./middlewares/auth');
const userProductRoutes = require('./routes/userProducts.routes');
const adminProductRoutes = require('./routes/adminProducts.routes');
const passport = require('passport');
require('./config/passport')

require('dotenv').config();

connectDb();
const app = express();

app.set('view engine', 'ejs');

app.use(express.json())
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_KEY,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 5 }

}));
app.use(passport.initialize());
app.use(passport.session());


app.use('/auth', authRoutes);
app.use('/user' , userRoutes);
app.use('/cart', cartRoutes);
app.use('/products', userProductRoutes);
app.use('/admin/' , adminProductRoutes);
app.use('/admin' , adminRoutes);

app.get('/', authenticateUser  , async (req, res) => {
  const { page = 1, limit = 4 } = req.query;
  const products = await Product.paginate({} , {page : page , limit:limit});
  console.log(req.user);
  res.render('index' , {
    totalDocs: products.totalDocs,
    limit: products.limit,
    totalPages: products.totalPages,
    currentPage: products.page,
    pagingCounter: products.pagingCounter,
    hasPrevPage: products.hasPrevPage,
    hasNextPage: products.hasNextPage,
    prevPage: products.prevPage,
    nextPage: products.nextPage,
    user:req.user , req , products : products.docs});
});

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
