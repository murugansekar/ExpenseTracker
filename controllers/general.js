const { Op } = require("sequelize");
const path = require('path');
const User = require('../models/user');
const sequelize = require('../util/database');
const { validationResult } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const Expense = require('../models/expense')
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const Order = require('../models/orders')
var ITEMS_PER_PAGE=10;

const uuid = require('uuid');
const sgMail = require('@sendgrid/mail');
const Forgotpassword = require('../models/forgotpassword');

const PDFDocument = require('pdfkit');
const fs = require('fs');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1} = require('uuid');

exports.POSTsignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const pNumber = req.body.pNumber;
  const password = req.body.password;
  const errors = validationResult(req);
  User.count({where: {[Op.or]: [{ email: email },{ pNumber: pNumber }]}})
  .then(dupExists => { 
    if(dupExists){return res.json({success:0 , message:'User already exists'});}
    return bcrypt.hash(password,12)
      .then(hashedPassword =>{
      User.create({name:name,email:email,premium:'0',pNumber:pNumber,password:hashedPassword})
      .then(result => {return res.json({success:1,  message:'Signup Successful'})}) }) 
  }).catch(err => {console.log(err)});   
}
 
/*
exports.GETsignup = (req, res, next) => {
    res.sendFile(path.join(__dirname,`../public/signup.html`))
};
*/
/*
exports.GETsignin = (req, res, next) => {
  res.sendFile(path.join(__dirname,`../public/signin.html`))
};
*/

exports.POSTsignin = (req, res, next) => {
  const password = req.body.password;
  const email = req.body.email;
  User.findOne({where:{email: email}})
  .then(exists => { 
    if(!exists){return res.status(404).json({success:0,message:'User not found'});} 
    bcrypt.compare(password,exists.password)
    .then(doMatch => {if(doMatch) {
      const jwtoken = jwt.sign(exists.id, process.env.TOKEN_SECRET);
      return res.json({success:1,token:jwtoken}); } 
    res.status(401).json({success:0, message:'User unauthorized'})  })
    .catch(err => {console.log(err); res.json({success:0, message:'Something went wrong'});})  
  }).catch(err => {console.log(err)})
};


exports.GETexpense = (req, res, next) => {
  req.user.getExpenses().then(result => {return res.json(result)}).catch(err => {console.log(err)})
};

exports.authenticate = (req,res,next) => {
    const token = req.header('authorization')
    const userid = Number(jwt.verify(token,process.env.TOKEN_SECRET))
    User.findByPk(userid).then(user => {
      req.user=user;
      next();
    }).catch(err => {console.log(err)})
}

exports.POSTexpense = (req, res, next) => {
  const expenseamount = req.body.expenseamount;
  const description = req.body.description;
  const category = req.body.category; 
  req.user.createExpense({expenseamount: expenseamount,description: description,category: category}).then(result => {return res.json({success:1})}).catch(err => {console.log(err)})
};

    

exports.get404 = (req, res, next) => {
  res.status(404).send("<h1>Page Not Found!</h1>")
};


exports.getExpenses = (req, res, next) => {
  Expense.findAll()
    .then(expenses => {res.json({expenses, success:"true"})})
    .catch(err => {console.log(err);});
};


exports.deletExpense = (req, res, next) => {
  const expenseid = req.params.expenseid;
    Expense.destroy({where: { id: expenseid }})
    .then(() => { 
      return res.status(204).json({ success: true, message: "Deleted Successfuly"}) })
    .catch(err => {console.log(err);
        return res.status(403).json({ success: true, message: "Failed"}) })
}

//premium paayment
exports.purchasepremium = async (req, res) => {
  try {
      var rzp = new Razorpay({key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET })
      const amount = 2500;
      rzp.orders.create({amount, currency: "INR"}, (err, order) => {
          if(err) {throw new Error(err);}
          req.user.createOrder({ orderid: order.id, status: 'PENDING'})
          .then(() => {return res.status(201).json({ order, key_id : rzp.key_id});})  
          .catch(err => {console.log(err);})  })
       } 
  catch(err){console.log(err);
    res.status(403).json({ message: 'Something went wrong', error: err})}
}

exports.updateTransactionStatus = (req, res ) => {
  try {
      const { payment_id, order_id} = req.body;
      Order.findOne({where : {orderid : order_id}}).then(order => {
          order.update({ paymentid: payment_id, status: 'SUCCESSFUL'}).then(() => {
              req.user.update({ispremiumuser: true})
              return res.status(202).json({sucess: true, message: "Transaction Successful"});
          }).catch((err)=> {console.log(err);})
      }).catch(err => {console.log(err);})
  } catch (err) {
      console.log(err);
      res.status(403).json({ error: err, message: 'Something went wrong' })
  }
}


/*
exports.forgotPassword = (req, res, next) => {
  const email = req.body.email;
};*/



exports.TotalExpense = (req, res, next) => {
  var output = []
  User.findAll()
  .then((users) => { 
    let count=users.length;
    users.forEach(user => {
      var sum=0;
      user.getExpenses()
      .then((result)=>
      {
        for(let i=0;i<result.length;i++)
        sum=sum+result[i].expenseamount;
        let myObj = {}
        myObj.name = user.name; 
        myObj.expense = sum;
        output.push(myObj);
        count=count-1;
        return output;
      })
      .then((out) => {
        if(count===0)
        return res.json(out)})
       })
        })
};


exports.premiumUserOrNOt = (req, res, next) => {
  const token = req.params.token;
  const userid = Number(jwt.verify(token,process.env.TOKEN_SECRET))
  User.findByPk(userid).then(user => {
    user.update({premium: '1'})
  })
};

exports.GETpremiumUserOrNOt = (req, res, next) => {
  const token = req.params.token;
  const userid = Number(jwt.verify(token,process.env.TOKEN_SECRET))
  User.findByPk(userid).then(user => {return res.json(user.premium)}) 
};

exports.pdfGenerate = (req, res, next) => {
  const invoicePath = path.join('data','a2.pdf')
  //console.log(invoicePath)
  const pdfDoc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'inline: filename="a2"')
  pdfDoc.pipe(fs.createWriteStream(invoicePath))
  pdfDoc.pipe(res)
  pdfDoc.text("Hello World")
};

exports.downloadFile = async (req, res, next) => {
  try 
  {
    console.log(req.user.premium)
    if(!req.user.premium)
      {return res.status(401).json({success: false, message:'Not a premium User'})}
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING; 
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerName = 'MuruganSekar2608ExpenseTracker'; 
    console.log('\nCreating container...');
    console.log('\t', containerName);
    const containerClient = await blobServiceClient.getContainerClient(containerName);
    if(!containerClient.exists())
    {
      const createContainerResponse = await containerClient.create({ access: 'container'});
      console.log("Container was created successfully. requestId: ", createContainerResponse.requestId);
    }
    const blobName = 'Expenses' + uuidv1() + '.txt';
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    console.log('\nUploading to Azure storage as blob:\n\t', blobName);
    const data =  JSON.stringify(await req.user.getExpenses());
    const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
    console.log("Blob was uploaded successfully. requestId: ", JSON.stringify(uploadBlobResponse));
    const fileUrl = `https://demostoragesharpener.blob.core.windows.net/${containerName}/${blobName}`;
    res.status(201).json({ fileUrl, success: true}); 
  } 
  catch(err) 
  {
  res.status(500).json({ error: err, success: false, message: 'Something went wrong'})
  }
};


exports.forgotpassword = async (req, res) => {
  try { const  email  =  req.body.email; 
      const user = await User.findOne({where:{email: email}});
      if(user){ const id = uuid.v4();
  user.createForgotpassword({ id , active: true }).catch(err => {throw new Error(err)})
  let ResetLink = "http://3.101.24.227:3000/password/resetpassword/"+id;
  return res.json(ResetLink);
          /*sgMail.setApiKey(process.env.SENGRID_API_KEY)
          const msg = {
              to: email, 
              from: 'yj.rocks.2411@gmail.com', 
              subject: 'Password Reset',
              text: 'Please find password reset link',
              html: `<a href="http://3.101.24.227:3000/password/resetpassword/${id}">Reset password</a>`,}
              
          sgMail.send(msg).then((response) => {
              return res.status(response[0].statusCode).json({message: 'Link to reset password sent to your mail ', success: true})
          }).catch((error) => {throw new Error(error);})*/
      }
      else {throw new Error('User doesnt exist')}
      } 
  catch(err){console.error(err);return res.json({ message: err, success: false });}
}

exports.resetpassword = (req, res) => {
  const id =  req.params.id;
  Forgotpassword.findOne({ where : { id }})
  .then(forgotpasswordrequest => {
      if(forgotpasswordrequest)
      {
          forgotpasswordrequest.update({ active: false});
          res.status(200).send(`<html>
  <script>function formsubmitted(e){e.preventDefault();console.log('called')} </script>
          <form action="/password/updatepassword/${id}" method="get">
              <label for="newpassword">Enter New password</label>
              <input name="newpassword" type="password" required></input>
              <button>Reset</button>
          </form></html>`)
          res.end()
      }
  })
}

exports.updatepassword = (req, res) => {
  try 
  {
    const { newpassword } = req.query;
    const { resetpasswordid } = req.params;
    Forgotpassword.findOne({ where : { id: resetpasswordid }})
    .then(resetpasswordrequest => {
      User.findOne({where: { id : resetpasswordrequest.userId}})
      .then(user => { if(user) 
        {
          const saltRounds = 10;
          bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err){console.log(err);throw new Error(err);}
            bcrypt.hash(newpassword, salt, function(err, hash) {
              if(err){console.log(err);throw new Error(err);}
                user.update({ password: hash })
                .then(() => {res.status(201).json({message: 'Successfuly updated'})
                          })
                      });
                  });
              } 
          else{return res.status(404).json({ error: 'No user Exists', success: false})}
          })
      })
  } 
  catch(error){return res.status(403).json({ error, success: false } )}
}



exports.getIndex = async (req, res, next) => {
  const token = req.query.token;
  const userid = Number(jwt.verify(token,process.env.TOKEN_SECRET))
  let totalItems = await Expense.count({where:{userId: userid}})
  const page = +req.query.page||1;
  
  User.findByPk(userid)
  .then(user => {
    user.getExpenses({ offset: (page-1)*ITEMS_PER_PAGE, limit: ITEMS_PER_PAGE })
    .then(expenses => { res.json({expenses, currentPage : page,
      totalExpenses: expenses.count,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)})})
    .catch((err)=> {console.log(err);})
  }) 
};




exports.setITEMS_PER_PAGE = (req, res, next) => {
  ITEMS_PER_PAGE = +req.params.rowSize||10;
  res.json({success: ITEMS_PER_PAGE})
}