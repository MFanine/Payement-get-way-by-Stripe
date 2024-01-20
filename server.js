const dotenv = require('dotenv');
dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

console.log(stripeSecretKey, stripePublicKey);

const express = require('express');
const app = express();
const fs = require('fs');
const stripe = require('stripe')(stripeSecretKey)

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public')); // Serve static files from the public directory

app.get('/store', function (req, res) {
    fs.readFile('items.json', 'utf8', function (error, data) {
        if (error) {
            console.error('Error reading items.json:', error);
            res.status(500).end();
        } else {
            res.render('store.ejs', {
                //stripePublicKey: stripePublicKey,
                items: JSON.parse(data),
                stripePublicKey: stripePublicKey
            });
        }
    });
});


app.post('/purchase', function (req, res) {
    fs.readFile('items.json', 'utf8', function (error, data) {
        if (error) {
            console.error('Error reading items.json:', error);
            res.status(500).end();
        } else {
            const itemJson = JSON.parse(data)
            const itemArray = itemJson.music.concat(itemJson.merch)
            let total = 0
            req.body.items.forEach(function(item) {
                const itemJson = itemArray.find(function(i){
                    return i.id === item.id
                })
             total = total + itemJson.price * item.quantity
            });
            stripe.charges.create({
                amount: total,
                source: req.body.stripeTokenId,
                currency: "Mad",
            }).then(function(){
                console.log('Charge Successful')
                res.json({message: 'Successfully puchased items'})
            }).catch(function(){
                console.log('Charge Fail')
                res.status(500).end()
            })
        }
    });
});

app.listen(process.env.PORT, function () {
    console.log('Server is running on port', process.env.PORT);
});
