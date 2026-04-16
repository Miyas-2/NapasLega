require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing dasar
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('NapasLega Backend Services are running.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
