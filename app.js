import Express from "express";
const app = Express();
import bodyParser from "body-parser";
import request from "request"
import https from "https";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.urlencoded({extended: true}));//middleware
app.use(Express.static(__dirname + '/public'));
//most complicated error faced till now
//now all static pages to be pulled in html should be located in this public folder
//to be accessed from backend, i.e while giving static paths in html we should keep
// in mind that we are in public folder and then give paths accordingly
// console.log(__dirname + '/public');


app.listen(process.env.PORT || 3000, () => {
    console.log("Server listening on 3000....");
});
//when deploying on server 3000 might not be suitable for server hence let it dynamically allocate it

app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/public/html/signup.html");
})

app.post('/', (req, res) => {
    let firstName = req.body.FirstName;
    let lastName = req.body.LastName;
    let email = req.body.Email;
    let apiKey = "b78ccfc5848a04404e55085c16ae7f9d-us21";
    let listId = "389aa8d6ac";
    // console.log(firstName + " " + lastName + " " + email);
    //here in url write exact number after 'us' i.e 21 in my case which is exact server allocated to you
    //found after logging in my mailchimp account -> in url
    const url = "https://us21.api.mailchimp.com/3.0/lists/" + listId;
    //to access exact list in which subscribers have to be added listId used
    const options = {
        method: "POST",
        auth: "growingcoder07:" + apiKey//to authenticate 
        //initial username ,like here growingcoder07, can be kept any as per documentation
    }
    //to make https post request you need url and options
    let data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    }
    let jsonData = JSON.stringify(data);
    
    const postReq = https.request(url, options, (response) =>{
        if(response.statusCode === 200){
            res.sendFile(__dirname + "/public/html/success.html");
            //after request for new subscriber sent successfully
        }
        else{
            res.sendFile(__dirname + "/public/html/failiure.html");
            //if api key wrong or other technical failiure
        }
        response.on("data", (data)=>{
            data = JSON.parse(data)
            // console.log(data.error_count);
            if(data.error_count == 0) 
                console.log(data.new_members[0].email_address + " has been added to the list");
            // console.log(data);
        })
    })//post request to mailchimp to store this new subscriber data

    postReq.write(jsonData);//to send data for post request
    postReq.end();//indicate end of post request hence send it now

})

app.post("/failiure", (req, res) =>{
    res.redirect("/");
})