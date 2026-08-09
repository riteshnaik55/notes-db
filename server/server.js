require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const notesRoutes = require("./routes/notes");

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://ritesh-notes.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
}));

// CORS configuration
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Login endpoint - verify password and issue JWT
app.post('/api/login', authLimiter, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Compare with stored password hash (in production, store hash in env or db)
    const isValidPassword = await bcrypt.compare(password, process.env.ACCESS_PASSWORD_HASH || password);

    // For initial setup, also check plain text (remove this in production)
    const isPlainValid = password === process.env.ACCESS_PASSWORD;

    if (!isValidPassword && !isPlainValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token with 5-minute expiry
    const token = jwt.sign(
      { authenticated: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRY || '5m' }
    );

    // Set HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 5 * 60 * 1000, // 5 minutes
      path: '/'
    });

    res.json({
      success: true,
      message: 'Authentication successful',
      expiresIn: 300 // 5 minutes in seconds
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// Verify token endpoint (for checking auth status)
app.get('/api/verify', (req, res) => {
  const token = req.cookies.authToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ authenticated: true, expiresAt: decoded.exp });
  } catch (error) {
    res.json({ authenticated: false });
  }
});

// Auth middleware for protected routes
const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

app.use("/api/notes", authenticateToken, notesRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Notes</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f4efe6; color: #141414; }
    main { max-width: 900px; margin: 40px auto; padding: 24px; }
    .card { border: 3px solid #141414; border-radius: 16px; padding: 24px; background: #8bf0da; box-shadow: 6px 6px 0 #141414; }
    h1 { margin-top: 0; }
    p { line-height: 1.5; }
  </style>
</head>
<body>
  <main>
    <div class="card">
      <h1>Notes</h1>
      <p>The /v2 route is now being served successfully.</p>
      <p>This fallback keeps the deployment from returning a Vercel 404 for client-side routes.</p>
    </div>
  </main>
</body>
</html>`;

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

app.get(/^(?!\/api\/).*/, (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.type('html').send(fallbackHtml);
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Authentication token expires in: ${process.env.TOKEN_EXPIRY || '5m'}`);
  });
}

module.exports = app;