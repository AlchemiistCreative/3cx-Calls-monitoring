
const rp = require('request-promise');
var tough = require('tough-cookie');
const mysql = require('mysql');
require('dotenv').config();

let connection = mysql.createConnection({
    host     : process.env.SQL_HOST,
    user     : process.env.SQL_USER,
    password : process.env.SQL_PASSWORD,
    database : process.env.SQL_DB
  });
  
  connection.connect();



function api(){
    const username = process.env.USERNAME
    const password = process.env.PASSWORD
    const instance = process.env.INSTANCE
    const domain = process.env.DOMAIN
    const interval = process.env.INTERVAL
    const path_login = "/api/login"
    const path_logout = "/api/logout"
    const key = "keyexample"
    const value = "valueexample"
    const data = 	
        {
          "username": `${username}`,
          "password": `${password}`,
        }
      
    let cookie = new tough.Cookie({
        key: key.toString('base64'),
        value: value.toString('base64'),
        domain: domain,
        httpOnly: true,
        maxAge: 31536000,
        headers: {'User-Agent': 'Request-Promise'}
        });
    
    
    var cookiejar = rp.jar();
    
    cookiejar.setCookie(cookie.toString(), instance);    
        
    
    //console.log(data);
  
    var options_req_login = {
      method: 'POST',
      uri: instance + path_login,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'charset': 'UTF-8'
      },
      json: data,
      jar: cookiejar
    }
    
    var options_req_logout = {
        method: 'POST',
        uri: instance + path_logout,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'charset': 'UTF-8'
        },
        json: {},
        jar: cookiejar
      }

    var options_res = {
        uri: instance + '/api/activeCalls',
        jar: cookiejar
    };



  rp(options_req_login)
  .then(function (parsedBody_req_login) {

     if(parsedBody_req_login == 'AuthSuccess'){
        //console.log(parsedBody_req_login);
        rp(options_res)
        .then(function (parsedBody_res) {


        
            var int_call = 0;
            var ext_call = 0;
            let strext = "SIP-Trunk";
            let pbxdata = JSON.parse(parsedBody_res)
            let items = pbxdata.list
            
            // let ext_caller = items[0]['Caller']
     
            // console.log(ext_caller)
    
            for (i of items){
               
                console.log(i['Caller'])

               

                if(i['Caller'].includes(strext) || i['Callee'].includes(strext)){
                    
                    ext_call++;

                }else{

                    int_call++;

                }


            }


            connection.query('INSERT INTO pbxdb SET dates = NOW(),externalcall = ?, internalcall = ?', [ext_call ,int_call], (err, result) => {
                if (err) throw err
            });

            console.log('External call:' + ext_call);
            console.log('Internal call:' + int_call);
            // rp(options_req_logout)
            // .then(function (parsedBody_req_logout) {
            
      
            // })
            // .catch(function (err) {
            //    console.log(err.message)
            // });

            //console.log(parsedBody_res);
        })
        .catch(function (err) {
            console.log(err.message)
        });

     }

  })
  .catch(function (err) {
    console.log(err);
  }); 


  setTimeout(api, interval);


  }



  api();