import express from 'express';
import compression from 'compression';

const app = express();

const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

if (IS_PROD) app.use(compression());

app.use(express.static('public/'));

app.listen(PORT, () => console.log(`>> Server is running on http://localhost:${PORT}`));
