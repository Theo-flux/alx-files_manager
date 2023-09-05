import express from 'express';
import router from './routes';

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());

app.get('/status', router);
app.get('/stats', router);
app.post('/users', router);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
