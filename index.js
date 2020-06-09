const express = require('express');
const path = require('path');

const app = express();
 

//express static file
app.use(express.static(path.join(__dirname , "public")));
//init body parser
app.use(express.json());
app.use(express.urlencoded({extended : false}));

//timestamp microservice
app.use("/api/timestamp" , require('./routes/api/time'))
//header parser microservice
app.use("/api/whoami" , require('./routes/api/header'))
//url shortener microservice
app.use("/api/shorturl" , require('./routes/api/url'))
//exercise tracker microservice
app.use("/api/exercise" , require('./routes/api/tracker'))
//file metadata microservice
app.use("/api/fileanalyse" , require('./routes/api/file'))


//listen to ports
const PORT = process.env.PORT || 3000;

app.listen(PORT , ()=>console.log(`App is listening to port : ${PORT}`))