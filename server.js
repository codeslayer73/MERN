var express = require('express');
const connectDB = require('./config/db');

var app = express();

connectDB();

const PORT = process.env.PORT || 5000;

app.use(express.json({ extended: false }));

app.get('/',(req, res) => res.send('API is working'));

app.use('/api/user', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/post', require('./routes/api/post'));

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
// respond with "hello world" when a GET request is made to the homepage
