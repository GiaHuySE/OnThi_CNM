const {req,res} = require('express');
const express = require('express');
const multer = require('multer');

const app = express();
const upload = multer();

 

app.use(express.static('./templates'));
app.set('view engine','ejs');
app.set('views','./templates');

const AWS = require('aws-sdk');
const config = new AWS.Config({
    accessKeyId: 'AKIA47TOVKHL245ZKHXQ',
    secretAccessKey: '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',
    region: 'ap-southeast-1',
})

AWS.config = config;
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'BaiBao';

app.get('/',(req,res) =>{
    const params = {
        TableName : tableName
    };
    docClient.scan(params,(err,data)=>{
        if(err){
            res.send('Server Error');
        }
        else{
            return res.render('index',{ baiBao:data.Items });
        }
    });
});

app.get('/add',(req,res)=>{
    res.render('add');
});

app.post('/',upload.fields([]),(req,res)=>{
    const {TenBaiBao,ChiSoISBN,NamXuatBan,SoTrang,TenNhomTacGia} = req.body;

    const params = {
        TableName : tableName,
        Item :{
            "TenBaiBao":TenBaiBao,
            "ChiSoISBN":ChiSoISBN,
            "NamXuatBan":NamXuatBan,
            "SoTrang":SoTrang,
            "TenNhomTacGia":TenNhomTacGia
        },
       
    };
    docClient.put(params,(err,data)=>{
        if(err){
             res.send('Server Error');
        }
        else{
            return res.redirect('/')
        }
    })
});



//Xoa San Pham
app.post('/delete', upload.fields([]), (req, res) => {
    const listenItems = Object.keys(req.body);
    console.log(listenItems);
    if(listenItems.length === 0){
        return res.redirect("/");
    }
    function onDeleteItem(index){
        const params = {
            TableName : tableName,
            Key:{
                "TenBaiBao":listenItems[index]
            }
        }
        docClient.delete(params,(err,data)=>{
            if(err){ 
                return res.send('Internal Server Error');
            }else{
                if(index > 0){
                    onDeleteItem(index -1);
                }else{
                    return res.redirect("/");
                }
            }
        })
    }
    onDeleteItem(listenItems.length-1);
});
app.listen(4000,() =>{
    console.log('Running on port 4000');
})