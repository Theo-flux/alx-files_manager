import express from 'express';
import router from './routes';

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

// app route
app.get('/status', router);
app.get('/stats', router);

// users route
app.post('/users', router);
app.get('/users/me', router);

// auth route
app.get('/connect', router);
app.get('/disconnect', router);

// files route
// app.post('/files', router);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
