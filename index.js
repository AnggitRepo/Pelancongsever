var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport	= require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the user model
var gallery        = require('./app/models/gallery'); // get the foto model
var port        = process.env.PORT || 8080;
var jwt         = require('jwt-simple');
 
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
}); 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(passport.initialize());
require('./config/passport')(passport);
mongoose.connect(config.database);
require('./config/passport')(passport); 
var apiRoutes = express.Router();

app.get('/', function(req, res) {
  res.send('Hello! The API is at hahahha angggit');
});

app.use('/api', apiRoutes);

apiRoutes.post('/signup', function(req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({success: false, msg: 'Masukkan Username Dan Password.'});
  } else {
    var newUser = new User({
      username: req.body.username,
      password: req.body.password,
      telp: req.body.telp,
      email: req.body.email
    });
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Nama Sudah Ada.'});
      }
      res.json({success: true, msg: 'Berhasil Mendaftar.'});
    });
  }
});

apiRoutes.get('/datauser', function(req, res)
{
  User.find((err, recs) =>
  {
    if (err)
    {
     console.dir(err);
   }
   res.json(recs);
 });
});

apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({
    username: req.body.username
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.send({success: false, msg: 'Pengguna Tidak Diketahui.'});
    } else {
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          var token = jwt.encode(user, config.secret);
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.send({success: false, msg: 'Password Salah.'});
        }
      });
    }
  });
});
 
getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

apiRoutes.post('/gallery', function(req, res)
{
 var gambar    = req.body.gambar,
 gambar2    = req.body.gambar2,
 nama       = req.body.nama,
 kategori   = req.body.kategori,
 keterangan    = req.body.keterangan,
 displayed    = req.body.displayed,
 like   = req.body.like,
 dislike  = req.body.dislike,
 latitude   = req.body.latitude,
 longitude  = req.body.longitude,
 waktu       = Date.now();
 
 gallery.create({ 
  gambar     : gambar,
  gambar2     : gambar2,
  nama      : nama,
  kategori  : kategori,
  keterangan   : keterangan,
  displayed     : displayed,
  like  : like,
  dislike : dislike,
  latitude  : latitude,
  longitude : longitude,
  waktu     : waktu},

  function (err, small)
  {
    if (err)
    {
     console.dir(err);
   }
   res.json({ message: 'success' });
 });

});

apiRoutes.get('/gallery', function(req, res)
{
  gallery.find({ displayed: true }, (err, recs) =>
  {
    if (err)
    {
     console.dir(err);
   }
   res.json({records:recs});
 });
});

var sort = { like: -1 };
apiRoutes.get('/populer', function(req, res)
{
  gallery.find({ displayed: true }, (err, recs) =>
  {
    if (err)
    {
     console.dir(err);
   }
   res.json({records:recs});
 }).limit(10).sort(sort);
});


apiRoutes.put('/gallery/:recordID', function(req, res)
{
  gallery.findById({ _id: req.params.recordID }, (err, recs) =>
  {
    if (err)
    {
     console.dir(err);
   }
   else
   {
     recs.gambar     = req.body.gambar  || recs.gambar;
     recs.gambar2     = req.body.gambar2  || recs.gambar2;
     recs.nama        = req.body.nama     || recs.nama;
     recs.kategori      = req.body.kategori || recs.kategori;
     recs.keterangan     = req.body.keterangan  || recs.keterangan;
     recs.displayed     = req.body.displayed  || recs.displayed;

     recs.save((err, recs) =>
     {
      if (err)
      {
       res.status(500).send(err)
     }
     res.json({ records: recs });
   });
   }
 });
});

apiRoutes.delete('/gallery/:recordID', function(req, res)
{
  gallery.findByIdAndRemove({ _id: req.params.recordID }, (err, recs) =>
  {
    if (err)
    {
     console.dir(err);
   }
   res.json({ records: recs });
 });
});

apiRoutes.put('/like/:id', (req, res) => {
  gallery.findById(req.params.id, function (err, theUser) {
        if (err) {
            console.log(err);
        } else {
            theUser.like += 1;
            theUser.save();
            res.send({LikeCount: theUser.like});
        }
    });
});
apiRoutes.put('/dislike/:id', (req, res) => {
  gallery.findById(req.params.id, function (err, theUser) {
        if (err) {
            console.log(err);
        } else {
            theUser.dislike += 1;
            theUser.save();
            res.send({DislikeCount: theUser.dislike});
        }
    });
});

app.listen(port);
console.log('listing di port :' + port);