const express = require('express');
const mongoose = require('mongoose');
const authroutes = require('./routes/authroutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authmiddleware');
const Diary = require('./models/diary');
const { render } = require('express/lib/response');

const app = express()

//middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//view engine
app.set('view engine', 'ejs');

//database connection
const dbURI = 'mongodb+srv://seyijaz:Siyanbola20.@cluster0.pgyrg.mongodb.net/note-tuts?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => app.listen(3030))
    .catch((err) => console.log(err));

//routes
app.get('*', checkUser);
app.get('/', (req,res) => {
    res.render('home');
});


app.get('/add-diary', (req,res) => {
    const diary = new Diary({
        title: 'new blog',
        snippet: 'my new blog',
        body: 'more about my new blog'
    });

    diary.save()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get('/diarylist', (req,res) => {
    Diary.find().sort({ createdAt: -1 })
        .then((result) => {
            res.render('diarylist', { title: 'All DiaryList', diarylist: result })
        })
        .catch((err) => {
            console.log(err);
        })
});


app.post('/diarylist', (req,res) => {
    const diary = new Diary(req.body);

    diary.save()
        .then((result) => {
            res.redirect('/diarylist');
        })
        .catch((err) => {
            console.log(err);
        })
});

app.get('/diarylist/:id', (req, res) => {
    const id = req.params.id;
    Diary.findById(id)
        .then(result => {
            res.render('details', { diary: result, title: 'Diary Details' });
        })
        .catch(err => {
            console.log(err);
        })
});

app.delete('/diarylist/:id', (req,res) => {
    const id = req.params.id;
    Diary.findByIdAndDelete(id)
        .then(result => {
            res.json({ redirect: '/diarylist' })
        })
        .catch(err => {
            console.log(err);
        })

})

app.get('/diarylist', requireAuth, (req, res) => res.render('diarylist'));
app.get('/diarylist/newentry', (req, res) => {
    res.render('newentry', { title: 'Create a diary'});
});
app.use(authroutes);

