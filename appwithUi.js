const express=require('express');
const app=express();
const dotenv=require('dotenv');
dotenv.config();
const port=process.env.PORT||7123;
const mongo=require('mongodb');
const MongoClient=mongo.MongoClient;
const bodyParser=require('body-parser');
const cors=require('cors');
const mongoUrl=process.env.mongoUrl
let db;
let col_name="octUser";
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
//static file path
app.use(express.static(__dirname+'/public'));
//html file path
app.set('views','./src/views');
//view engine
app.set('view engine','ejs');
//health check (dummy url)
app.get('/',(req,res)=>{
    db.collection(col_name).find({}).toArray((err,result)=>{
        if(err)throw err;
        res.status(200).render("index",{data:result})
    })
   
})
app.get('/new',(req,res)=>{
    res.render("admin")
})
//Read(get) all data
app.get('/users',(req,res)=>{
    var query={}
    if(req.query.city && req.query.role){
        query={role:req.query.role, city:req.query.city, isActive:true}
    }
    else if(req.query.role){
        query={role:req.query.role, isActive:true}
    }
   else if (req.query.city){
        query={city:req.query.city, isActive:true}
    }
    else if(req.query.isActive){
        let isActive=req.query.isActive
        if(isActive=="false"){
            isActive=false
        }else{
            isActive=true
        }
        query={isActive:isActive}
    }
    else{
        query={isActive:true}
    }
    
    db.collection(col_name).find(query).toArray((err,data)=>{
        if(err)throw err;
        res.status(200).send(data)
    })
})
//find particular users 
app.get('/users/:id',(req,res)=>{
    var id= mongo.ObjectId(req.params.id);
    db.collection(col_name).find({_id:id}).toArray((err,result)=>{
        if(err)throw err;
        res.status(200).send(result)
    })
})
//post all data 
app.post('/addUser',(req,res)=>{
    console.log(req.body);
    const data={
        "name":req.body.name,
        "city":req.body.city, 
        "phone":req.body.city, 
        "role":req.body.role?req.body.role:'User',
        isActive:true
    }
    db.collection(col_name).insert(data,(err,result)=>{
     if(err)throw err;
     res.redirect('/')
    })  
})
//upadte users
app.put('/updateUser',(req,res)=>{
    db.collection(col_name).updateOne(
        {_id:mongo.ObjectId(req.body._id)},
        {
            $set:{
                name:req.body.name,
                city:req.body.city,
                role:req.body.role,
                phone:req.body.phone,
            isActive:true}
        },(err,result)=>{
            if(err)throw err;
            res.status(200).send('data updated')
        }
    )
})
//delete users
app.delete('/deleteUser',(req,res)=>{
    db.collection(col_name).remove(
        {_id:mongo.ObjectId(req.body._id)},(err,result)=>{
            if(err)throw err;
            res.status(200).send("Data Deleted")
        }
    )
})
//deactivate
app.put('/deactivate',(req,res)=>{
    db.collection(col_name).updateOne(
        {_id:mongo.ObjectId(req.body._id)},
        {
            $set:{
                isActive:false
            }

            },(err,result)=>{
                if(err)throw err;
                db.collection(col_name).findOne({_id:mongo.ObjectId(req.body._id)},(err,result)=>{
                    res.send(`${result.name} is deatiated now`)
                })
               
            }
    )
})
//activate 
app.put('/activate',(req,res)=>{
    db.collection(col_name).updateOne(
        {_id:mongo.ObjectId(req.body._id)},
        {
            $set:{
                isActive:true
            }

            },(err,result)=>{
                if(err)throw err;
                res.send('activate')
            }
    )
})
//DB connection
MongoClient.connect(mongoUrl,(err,client)=>{
    if(err)console.log('Error While Connecting to Mongo')
    db=client.db('octmrng');
    app.listen(port,(err)=>{
        console.log(`serer is running on port ${port}`);
    })
})
