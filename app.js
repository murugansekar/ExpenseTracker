const path = require('path');
const fs = require('fs')
const express = require('express');
const dotenv = require('dotenv')
dotenv.config()
const bodyParser = require('body-parser');
var cors = require('cors')
const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const User = require('./models/user');
const Expense = require('./models/expense')
const Order = require('./models/orders');
const Forgotpassword = require('./models/forgotpassword');
//const helmet = require('helmet')
//const morgan = require('morgan')

const app = express();
app.use(cors())

const routes = require('./routes/general');
//const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'), {flags: 'a'})
//app.use(helmet())
//app.use(morgan('combined',{ stream: accessLogStream}))
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());    
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

app.use(errorController.get404);



app.use((req, res) => {
  res.sendFile(path.join(__dirname,`public/${req.url}`))
});

Expense.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Expense)
User.hasMany(Order);
Order.belongsTo(User);
User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User)


sequelize.sync() //{force: true}
.then(cart => {app.listen(3000)})
.catch(err => {console.log(err)})

//console.log(require('crypto').randomBytes(64).toString('hex'))
