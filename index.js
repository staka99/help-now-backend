const mysql = require('mysql');
const express = require('express');
const app = express();
const cors = require('cors');


const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const stripe = require('stripe')('sk_test_51L2gAnCQRdSSagWwG8CdalJzaqXFYsJhv1XEk6uuFu5J3AzNPrM7JJXBbojRB8I3arErVrumwvxo8fbVu2fBsDnc00dDtWJqNl');
const { v4: uuidv4 } = require('uuid');
uuidv4();

const bcyrpt = require('bcrypt')
const saltRounds = 10

var PORT = 3100;

app.use(bodyparser.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(cookieParser());
app.use(bodyparser.urlencoded({extended: true}));

app.use(session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 2147483647 
    }
}))


var mysqlConnection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password: 'root',
    database : 'hodb',
    multipleStatements: true
});

mysqlConnection.connect((err)=>{
    if(!err)
    console.log('DB konekcija uspješna.');
    else 
    console.log('DB konekcija neuspješna \n Greška : ' + JSON.stringify(err, undefined, 2));
});

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
}); 
  
app.get('/', (req, res) => {
    res.send('hello world')
  });


  
  app.post("/checkout", async (req, res) => {
    console.log("Request:", req.body);
  
    let error;
    let status;
    try {
      const { clanarina, token } = req.body;
  
      const customer = await stripe.customers.create({
        email: token.email,
        source: token.id
      });
  
      const idempotency_key = uuidv4();
      const charge = await stripe.charges.create(
        {
          amount: clanarina.iznos * 100,
          currency: "rsd",
          customer: customer.id,
          receipt_email: token.email,
          description: `Uplata članarine: ${clanarina.vrstaClanarine}`,
          shipping: {
            name: token.card.name,
            address: {
              line1: token.card.address_line1,
              line2: token.card.address_line2,
              city: token.card.address_city,
              country: token.card.address_country,
              postal_code: token.card.address_zip
            }
          }
        },
        {
          idempotency_key
        }
      );
      console.log("Charge:", { charge });
      status = "success";
    } catch (error) {
      console.error("Error:", error);
      status = "failure";
    }
  
    res.json({ error, status });
  });
  
  
//------------------------------- TABELA 1 - GRAD ---------------------------------------------------------

// Get all gradovi  
app.get('/grad',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.grad;',(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Get grad
app.get('/grad/:id',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.grad WHERE gradID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Delete grad
app.delete('/grad/:id',(req, res)=>{
    mysqlConnection.query('DELETE FROM hodb.grad WHERE gradID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno brisanje.');
        else
        console.log(err);
    })
});

// Insert grad
app.post('/grad',(req, res)=>{
    mysqlConnection.query('INSERT INTO hodb.grad (gradID, nazivGrada, postanskiBroj) VALUES (?,?,?)', [req.body.gradID, req.body.nazivGrada, req.body.postanskiBroj],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno dodavanje.');
        else
        console.log(err);
    })
});

// Update grad
app.put('/grad',(req, res)=>{
    mysqlConnection.query('UPDATE hodb.grad SET gradID = ?, nazivGrada = ?, postanskiBroj = ? WHERE gradID = ?', [req.body.gradID, req.body.nazivGrada, req.body.postanskiBroj, req.body.gradID],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješna izmjena.');
        else
        console.log(err);
    })
});

//------------------------------- TABELA 2 - CLANARINA ---------------------------------------------------------

// Get all clanarina  
app.get('/clanarina',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.clanarina;',(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Get clanarina
app.get('/clanarina/:id',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.clanarina WHERE clanarinaID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Delete clanarina
app.delete('/clanarina/:id',(req, res)=>{
    mysqlConnection.query('DELETE FROM hodb.clanarina WHERE clanarinaID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno brisanje.');
        else
        console.log(err);
    })
});

// Insert clanarina
app.post('/clanarina',(req, res)=>{
    mysqlConnection.query('INSERT INTO hodb.clanarina (clanarinaID, vrstaClanarine, iznos) VALUES (?,?,?)', [req.body.clanarinaID, req.body.vrstaClanarine, req.body.iznos],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno dodavanje.');
        else
        console.log(err);
    })
});

// Update clanarina
app.put('/clanarina',(req, res)=>{
    mysqlConnection.query('UPDATE hodb.clanarina SET clanarinaID = ?, vrstaClanarine = ?, iznos = ? WHERE clanarinaID = ?', [req.body.clanarinaID, req.body.vrstaClanarine, req.body.iznos, req.body.clanarinaID],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješna izmjena.');
        else
        console.log(err);
    })
});

//------------------------------- TABELA 3 - OCUVANOST ---------------------------------------------------------

// Get all ocuvanost  
app.get('/ocuvanost',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.ocuvanost;',(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Get ocuvanost
app.get('/ocuvanost/:id',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.ocuvanost WHERE ocuvanostID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Delete ocuvanost
app.delete('/ocuvanost/:id',(req, res)=>{
    mysqlConnection.query('DELETE FROM hodb.ocuvanost WHERE ocuvanostID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno brisanje.');
        else
        console.log(err);
    })
});

// Insert ocuvanost
app.post('/ocuvanost',(req, res)=>{
    mysqlConnection.query('INSERT INTO hodb.ocuvanost (ocuvanostID, ocuvanostOdjece) VALUES (?,?)', [req.body.ocuvanostID, req.body.ocuvanostOdjece],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno dodavanje.');
        else
        console.log(err);
    })
});

// Update ocuvanost
app.put('/ocuvanost',(req, res)=>{
    mysqlConnection.query('UPDATE hodb.ocuvanost SET ocuvanostID = ?, ocuvanostOdjece = ? WHERE ocuvanostID = ?', [req.body.ocuvanostID, req.body.ocuvanostOdjece, req.body.ocuvanostID],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješna izmjena.');
        else
        console.log(err);
    })
});

//------------------------------- TABELA 4 - VRSTA_ODJECE ---------------------------------------------------------

// Get all vrsta_odjece  
app.get('/vrsta_odjece',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.vrsta_odjece;',(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Get vrsta_odjece
app.get('/vrsta_odjece/:id',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.vrsta_odjece WHERE vrstaOdjeceID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Delete vrsta_odjece
app.delete('/vrsta_odjece/:id',(req, res)=>{
    mysqlConnection.query('DELETE FROM hodb.vrsta_odjece WHERE vrstaOdjeceID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno brisanje.');
        else
        console.log(err);
    })
});

// Insert vrsta_odjece
app.post('/vrsta_odjece',(req, res)=>{
    mysqlConnection.query('INSERT INTO hodb.vrsta_odjece (vrstaOdjeceID, nazivVrste) VALUES (?,?)', [req.body.vrstaOdjeceID, req.body.nazivVrste],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno dodavanje.');
        else
        console.log(err);
    })
});

// Update vrsta_odjece
app.put('/vrsta_odjece',(req, res)=>{
    mysqlConnection.query('UPDATE hodb.vrsta_odjece SET vrstaOdjeceID = ?, nazivVrste = ? WHERE vrstaOdjeceID = ?', [req.body.vrstaOdjeceID, req.body.nazivVrste, req.body.vrstaOdjeceID],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješna izmjena.');
        else
        console.log(err);
    })
});

//------------------------------- TABELA 5 - ADRESA ---------------------------------------------------------

// Get all adresa  
app.get('/adresa',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.adresa;',(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Get adresa
app.get('/adresa/:id',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.adresa WHERE adresaID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Delete adresa
app.delete('/adresa/:id',(req, res)=>{
    mysqlConnection.query('DELETE FROM hodb.adresa WHERE adresaID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno brisanje.');
        else
        console.log(err);
    })
});

// Insert adresa
app.post('/adresa',(req, res)=>{
    mysqlConnection.query('INSERT INTO hodb.adresa (adresaID, ulica, broj, sprat, brojStana, gradID) VALUES (?,?,?,?,?,?)', [req.body.adresaID, req.body.ulica, req.body.broj, req.body.sprat,  req.body.brojStana, req.body.gradID],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno dodavanje.');
        else
        console.log(err);
    })
});

// Update adresa
app.put('/adresa',(req, res)=>{
    mysqlConnection.query('UPDATE hodb.adresa SET adresaID = ?, ulica = ?, broj = ?, sprat = ?, brojStana = ?, gradID = ? WHERE adresaID = ?', [req.body.adresaID, req.body.ulica, req.body.broj, req.body.sprat,  req.body.brojStana, req.body.gradID, req.body.adresaID],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješna izmjena.');
        else
        console.log(err);
    })
});

//------------------------------- TABELA 6 - KORISNIK ---------------------------------------------------------

// Get all korisnik  
app.get('/korisnik',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.korisnik k INNER JOIN hodb.grad g on (k.gradID = g.gradID);',(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Get korisnik
app.get('/korisnik/:id',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.korisnik WHERE korisnikID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Get login korisnik
app.get("/login",(req, res) => {
    if(req.session.user) {
        res.send({loggedIn: true, user: req.session.user})
    } else {
        res.send({loggedIn: false});
    }
})



// Post login korisnik
app.post('/login', (req, res)=>{
    const email = req.body.email;
    const lozinka = req.body.lozinka;

    mysqlConnection.query(
        "SELECT ime, prezime, email, lozinka, uloga FROM hodb.korisnik WHERE email = ?", 
        email,
        (err, result)=>{
        if(err) {
            res.send({err: err});
        }

        if (result.length > 0) {
            bcyrpt.compare(lozinka, result[0].lozinka, (error, response) => {
                if (response) {
                    req.session.user = result;
                    console.log(req.session.user);
                    res.send(result);
                } else {
                    res.send({ message: "Pogrešna lozinka ili email!"});
                }
            });
        } else {
            res.send({ message: "Korisnik ne postoji!"});
        }
    });
});


// Delete korisnik
app.delete('/korisnik/:id',(req, res)=>{
    mysqlConnection.query('DELETE FROM hodb.korisnik WHERE korisnikID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno brisanje.');
        else
        console.log(err);
    })
});

// Insert korisnik

app.post('/korisnik',(req, res)=>{
    const lozinka = req.body.lozinka;

    bcyrpt.hash(lozinka, saltRounds, (err, hash) => {    
    if(err){
        console.log(err);
    }
    mysqlConnection.query('INSERT INTO hodb.korisnik (ime, prezime, jmbg, datumRodjenja, pocetakVolontiranja, email, lozinka, adresa, gradID, clanarinaID, uloga) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [req.body.ime, req.body.prezime, req.body.jmbg, req.body.datumRodjenja, req.body.pocetakVolontiranja, req.body.email, hash, req.body.adresa, req.body.gradID, req.body.clanarinaID, req.body.uloga],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno dodavanje.');
        else
        console.log(err);
    })
})
});

// Update korisnik
app.put('/korisnik',(req, res)=>{
        mysqlConnection.query('UPDATE hodb.korisnik SET ime = ?, prezime = ?, jmbg = ?, datumRodjenja = ?, pocetakVolontiranja = ?, email = ?, lozinka = ?, adresa = ?, gradID = ?, clanarinaID = ?, uloga = ? WHERE korisnikID = ?', [req.body.ime, req.body.prezime, req.body.jmbg,  req.body.datumRodjenja, req.body.pocetakVolontiranja, req.body.email, req.body.lozinka, req.body.adresa, req.body.gradID, req.body.clanarinaID,  req.body.uloga, req.body.korisnikID],(err, rows, fields)=>{
            if(!err)
            res.send('Uspješna izmjena.');
            else
            console.log(err);  
    })
});

//------------------------------- TABELA 7 - REZERVACIJA ---------------------------------------------------------

// Get all rezervacija  
app.get('/rezervacija',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.rezervacija;',(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Get rezervacija
app.get('/rezervacija/:id',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.rezervacija WHERE rezervacijaID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Delete rezervacija
app.delete('/rezervacija/:id',(req, res)=>{
    mysqlConnection.query('DELETE FROM hodb.rezervacija WHERE rezervacijaID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno brisanje.');
        else
        console.log(err);
    })
});

// Insert rezervacija
app.post('/rezervacija',(req, res)=>{
    mysqlConnection.query('INSERT INTO hodb.rezervacija (rezervacijaID, dan, datum, vrijeme, korisnikID, volonterID) VALUES (?,?,?,?,?,?)', [req.body.rezervacijaID, req.body.dan, req.body.datum, req.body.vrijeme, req.body.korisnikID, req.body.volonterID],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno dodavanje.');
        else
        console.log(err);
    })
});

// Update rezervacija
app.put('/rezervacija',(req, res)=>{
    mysqlConnection.query('UPDATE hodb.rezervacija SET rezervacijaID = ?, dan = ?, datum = ?, vrijeme = ?, korisnikID = ?, volonterID = ? WHERE rezervacijaID = ?', [req.body.rezervacijaID, req.body.dan, req.body.datum, req.body.vrijeme, req.body.korisnikID, req.body.volonterID, req.body.rezervacijaID],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješna izmjena.');
        else
        console.log(err);
    })
});

//------------------------------- TABELA 8 - KOMAD_ODJECE ---------------------------------------------------------

// Get all komad_odjece  
app.get('/komad_odjece',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.komad_odjece;',(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Get komad_odjece
app.get('/komad_odjece/:id',(req, res)=>{
    mysqlConnection.query('SELECT * FROM hodb.komad_odjece WHERE komadID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send(rows);
        else
        console.log(err);
    })
});

// Delete komad_odjece
app.delete('/komad_odjece/:id',(req, res)=>{
    mysqlConnection.query('DELETE FROM hodb.komad_odjece WHERE komadID = ?', [req.params.id],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno brisanje.');
        else
        console.log(err);
    })
});

// Insert komad_odjece
app.post('/komad_odjece',(req, res)=>{
    mysqlConnection.query('INSERT INTO hodb.komad_odjece (komadID, velicina, boja, pol, rezervacijaID, vrstaID, ocuvanostID) VALUES (?,?,?,?,?,?,?)', [req.body.komadID, req.body.velicina, req.body.boja, req.body.pol, req.body.rezervacijaID, req.body.vrstaID, req.body.ocuvanostID],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješno dodavanje.');
        else
        console.log(err);
    })
});

// Update komad_odjece
app.put('/komad_odjece',(req, res)=>{
    mysqlConnection.query('UPDATE hodb.komad_odjece SET komadID = ?, velicina = ?, boja = ?, pol = ?, rezervacijaID = ?, vrstaID = ?, ocuvanostID = ? WHERE komadID = ?', [req.body.komadID, req.body.velicina, req.body.boja, req.body.pol, req.body.rezervacijaID, req.body.vrstaID, req.body.ocuvanostID, req.body.komadID],(err, rows, fields)=>{
        if(!err)
        res.send('Uspješna izmjena.');
        else
        console.log(err);
    })
});