var express=require("express")
var app=express()
const multer=require('multer');
const session=require("express-session");
app.use(express.static("public"));
app.use(express.static("public/CSS"))
app.use(express.static("public/fonts"))
app.use(express.static("public/images"))
app.use(express.static("public/js"))
app.use(express.static("public/upload"))
var bd=require('body-parser');
var ed=bd.urlencoded({extended:false});
app.set('view engine','ejs');

const storage=multer.diskStorage({  // diskStorage is a method of multer to Store an uploded image
       destination:(req,file,cb)=>{
        cb(null,'public/upload/');//directory to save uploaded files
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname);//Unique filename
    }
});
// Initialize multer with the storage configuration
const upload=multer({storage:storage});

app.use(session({
    secret:"999999",
    saveUninitialized:true,
    resave:true
}));

var my=require("mysql")
var con=my.createConnection({
host:'127.0.0.1',
user:'root',
password:'admin123',
database:'ecommerce'
});

con.connect(function(err)
{
    if (err)
        throw err;
    console.log("connect to mysql")
});

app.get("/",function(req,res)
{
res.sendFile("./public/index.html",{root:__dirname})
});
app.get("/index",function(req,res)
{
res.sendFile("./public/index.html",{root:__dirname})
});
app.get("/blog_list",function(req,res)
{
res.sendFile("./public/blog_list.html",{root:__dirname})
});
app.get("/contact",function(req,res)
{
res.sendFile("./public/contact.html",{root:__dirname})
});
app.get("/product",function(req,res)
{
var q="select * from product";
con.query(q,function(err,result)
{
    if (err)
        throw err;
res.render("product",{data:result});
});
});
app.get("/login",function(req,res)
{
res.sendFile("./public/login.html",{root:__dirname})
});
app.get("/admin",function(req,res)
{
res.sendFile("./public/admin.html",{root:__dirname})
});
app.get("/register",function(req,res)
{
res.sendFile("./public/Register.html",{root:__dirname})
});
app.get("/addproduct",function(req,res)
{
res.sendFile("./public/addproduct.html",{root:__dirname})
});

app.get("/Cart",function(req,res)
{
    var a= req.query.pid;
    var em=req.session.uem;
    var q="select * from cart where pid='"+a+"' and email='"+em+"'";
    con.query(q,function(err,result)
    {
        if(err)
            throw err;
        var L=result.length;
        if(L>0)
        {
         res.redirect("VCart");   
        }
        else
        {
            var q="select * from product where Pid='"+a+"'";
    con.query(q,function(err,result)
{
    var pn=result[0].Pname;
    var pr=result[0].Price;
    var pd=result[0].pdes;
    var qt="insert into cart values ('"+em+"','"+a+"','"+pn+"','"+pr+"','"+pd+"')";
con.query(qt,function(err,result)
{
    if(err)
        throw err;
    res.redirect("VCart");
});
});
}
});
});

app.get("/VCart",function(req,res)
{

    var mt="select * from cart where email='"+req.session.uem+"'";
    con.query(mt,function(err,result){
        if(err)
            throw err;
    res.render("VCart",{data:result});
});
});

app.get("/change_password",function(req,res)
{
res.render("update");
});
app.post("/Regregister",ed,function(req,res)
{
var a=req.body.name;
var b=req.body.email;
var c=req.body.password;
var d=req.body.rpassword;
var q="insert into register values('"+a+"','"+b+"','"+c+"')";
con.query(q,function(err,result)
{
    if(err)
        throw err
    else
        res.redirect("login");
});
});
app.post("/Regprocess",ed,function(req,res){
var a=req.body.name;
var b=req.body.email;
var c=req.body.subject;
var d=req.body.message;
var t="insert into contact values('"+a+"','"+b+"','"+c+"')";
con.query(t,function(err,result){
    if(err)
        throw err
    else
    res.send("you are successfully register");
});
});

app.post("/loginapp",ed,function(req,res){
var a=req.body.email;
var b=req.body.password;
var z="select * from register where email ='"+a+"' ";
con.query(z,function(err,result){
    if(err)
        throw err;
    var l=result.length;
    if(l>0)
    {
        var pw=result[0].password;
        if(pw==b)
        {
            req.session.una=result[0].name;
            req.session.uem=result[0].email;
            res.render("userhome",{name:req.session.una});
        }
        else
        res.send("password is incorrect")
    }
    else 
    res.send("email not found")
});
});

app.post("/Aloginapp",ed,function(req,res){
    var a=req.body.email;
    var b=req.body.password;
    var z="select * from admin where email ='"+a+"' ";
    con.query(z,function(err,result){
        if(err)
            throw err;
        var l=result.length;
        if(l>0)
        {
            var pw=result[0].password;
            if(pw==b)
                {
                req.session.aem=result[0].email;
                res.sendFile("./public/AHome.html",{root:__dirname});
            }
            else
            res.send("password is incorrect")
        }
        else 
        res.send("email not found")
    });
});
app.post("/addproduct",ed,upload.single('product_image'),function(req,res){
    var a=req.body.product_name;
    var b=req.body.product_id;
    var c=req.body.product_description;
    var d=req.body.product_price;
    var e=req.body.product_category;
    var f=req.body.product_quantity;
    var g=req.file.filename;
    var k="insert into product values('"+a+"','"+b+"','"+c+"',"+d+",'"+e+"',"+f+",'"+g+"')";
    con.query(k,function(err,result){
        if(err)
            throw err
        else
        res.send("you are successfully add the product");
    });
    });

    app.get("/ViUser",function(req,res){
        if(req.session.aem==null)
            res.redirect("admin");
        var q="select * from register";
        con.query(q,function(err,result){
            if(err)
                throw err;
            res.render("ViUsers",{data:result});
        });
    });
    app.get("/ViEnquire",function(req,res){
        if(req.session.aem==null)
            res.redirect("admin");
        var u="select * from contact";
        con.query(u,function(err,result){
            if(err)
                throw err;
            res.render("ViEnquire",{data:result});
       
        });
    });
    app.get("/ViProduct",function(req,res){
        if(req.session.aem==null)
            res.redirect("admin");
        var q="select * from product";
        con.query(q,function(err,result){
            if(err)
                throw err;
            res.render("ViProduct",{data:result}); // file name is taken with render //
        });
    });
    app.get("/Del",function(req,res)
{
    var a=req.query.Pid;
    var q="delete from product where Pid='"+a+"'";
    con.query(q,function(err,result){
        if(err)
            throw err;
        res.redirect("/ViProduct")
    });
});

app.get("/DeleteUser",function(req,res)
{
    var a=req.query.email;
    var q="delete from register where email='"+a+"'";
    con.query(q,function(err,result){
        if(err)
            throw err;
        res.redirect("/ViUser")
    });
});

app.get("/DeleteEnquire",function(req,res)
{
    var a=req.query.email;
    var q="delete from contact where email='"+a+"'";
    con.query(q,function(err,result){
        if(err)
            throw err;
        res.redirect("/ViEnquire")
    });
});

app.post("/update",ed,function(req,res)
{
var em=req.session.uem;
var p=req.body.P1;
var m=req.body.P2;
var q="update register set password='"+m+"' where email='"+em+"'and password='"+p+"'";
con.query(q,function(err,result)
{
    if(err)
        throw err
    var L=result.affectedRows // affectted rows declare how many rows are affected in the table//
    
    if(L>0)
        res.send("password updated");
    
    else
        res.send("Email or  password is incorrect");

});
});
app.get("/DeleteVCart",function(req,res)
{
    var b=req.query.pid;
    var q="delete from Cart where pid='"+b+"'";
    con.query(q,function(err,result){
        if(err)
            throw err;
        res.redirect("/VCart")
    });
});  

app.get("/OrderVCart",function(req,res)
{
var a= req.query.pid;
var em=req.session.uem;
var q="select * from cart where pid='"+a+"'and email='"+em+"'";
con.query(q,function(err,result){
    res.render("orderpage",{data:result});
})
});

app.listen(3000);
