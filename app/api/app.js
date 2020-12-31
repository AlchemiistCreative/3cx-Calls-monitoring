
const rp = require('request-promise');
var tough = require('tough-cookie');
const mysql = require('mysql');

let connection = mysql.createConnection({
    host     : 'db',
    user     : 'root',
    password : 'prootexample',
    database : '3cxmon'
  });
  
  connection.connect();



function api(){
    const username = "admin"
    const password = "8b6r4VITqM551bQh"
    const instance = "https://alchemist.my3cx.be"
    const domain = "alchemist.my3cx.be"
    const path_login = "/api/login"
    const path_logout = "/api/logout"

    const data = 	
        {
          "username": `${username}`,
          "password": `${password}`,
        }
      
    let cookie = new tough.Cookie({
        key: "some_key",
        value: "some_value",
        domain: domain,
        httpOnly: true,
        maxAge: 31536000
        });
    
    
    var cookiejar = rp.jar();
    
    cookiejar.setCookie(cookie, instance);    
        
    
    console.log(data);
  
    var options_req_login = {
      method: 'POST',
      url: instance + path_login,
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
        url: instance + path_logout,
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
        console.log(parsedBody_req_login);
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

                if(i['Caller'] == strext || i['Callee'] == strext){

                    ext_call++;

                }else{

                    int_call++;

                }


            }


            connection.query('INSERT INTO pbxdb SET dates = ?,externalcall = ?, internalcall = ?', [Date.now(),ext_call ,int_call], (err, result) => {
                if (err) throw err
    
                cb(result);
    
            });


            console.log(int_call);
            rp(options_req_logout)
            .then(function (parsedBody_req_logout) {
            
      
            })
            .catch(function (err) {
                console.log(err.message)
            });

            //console.log(parsedBody_res);
        })
        .catch(function (err) {
            console.log(err.message)
        });

     }

  })
  .catch(function (err) {
    console.log(err.message);
  }); 


  


  }



  api();