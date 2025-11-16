import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT =  process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In-memory storage (replace with database later)
const articles = [
  {
    id: 1,
    title: 'Modern Hayatta Stresi Anlamak',
    content: 'Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı. Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı.',
    excerpt: 'Streslim. Çok derdim var.',
    author: 'psk. Melike Çiftçi',
    date: new Date('2024-10-15'),
    published: true
  },
  {
    id: 2,
    title: 'Tırnak Yiyorum ne yapayım?',
    content: 'Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı. Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı.',
    excerpt: 'Yeme.',
    author: 'psk. Melike Çiftçi',
    date: new Date('2024-10-22'),
    published: true
  },
  {
    id: 3,
    title: 'Zorlukların karşısında direk gibi dimdik dur',
    content: 'Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı. Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı, Yazı.',
    excerpt: 'Özet, Özet, Özet',
    author: 'psk. Emre Can Çiftçi',
    date: new Date('2024-11-01'),
    published: true
  }
];

const psychologist = {
  name: 'Psk. Melike Çiftçi',
  credentials: 'Yüksek lisansı var bir üniversitede',
  bio: '15 yılı aşkın psikioloji terapileri eğitimleri akademi vesaire. Ayrıca başka bir sürü şey daha',
  photo: '/images/psychologist.jpg'
};

// Simple authentication
const adminCredentials = {
  username: 'melike',
  password: '123' 
};

// Middleware to check if user is logged in
const requireAuth = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Routes
app.get('/', (req, res) => {
  const publishedArticles = articles
    .filter(a => a.published)
    .sort((a, b) => b.date - a.date);
  
  res.render('index', { 
    articles: publishedArticles, 
    psychologist,
    isAuthenticated: req.session.isAuthenticated 
  });
});

app.get('/about', (req, res) => {
  res.render('about', { 
    psychologist,
    isAuthenticated: req.session.isAuthenticated 
  });
});

app.get('/article/:id', (req, res) => {
  const article = articles.find(a => a.id === parseInt(req.params.id));
  if (!article || !article.published) {
    return res.status(404).render('404', { isAuthenticated: req.session.isAuthenticated });
  }
  res.render('article', { 
    article,
    isAuthenticated: req.session.isAuthenticated 
  });
});

app.get('/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const results = articles.filter(a => 
    a.published && (
      a.title.toLowerCase().includes(query) ||
      a.content.toLowerCase().includes(query) ||
      a.excerpt.toLowerCase().includes(query)
    )
  );
  res.render('search', { 
    query, 
    results,
    isAuthenticated: req.session.isAuthenticated 
  });
});

/// Eskiden Anasayfada giriş butonu vardı

// app.get('/login', (req, res) => {
//   if (req.session.isAuthenticated) {
//     return res.redirect('/admin');
//   }
//   res.render('login', { 
//     error: null,        
//     welcome_message: '<h1>Sadece Yetkili Personel</h1>'
//   });
// });

// Same page but shortcut
app.get('/q', (req, res) => {
  if (req.session.isAuthenticated) {
    return res.redirect('/admin');
  }
  res.render('login', { 
    error: null,
    welcome_message: '<h1>Hoşgeldiniz Melike Hanım</h1>',
    special_login_css: 'special-login' 
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === adminCredentials.username && password === adminCredentials.password) {
    req.session.isAuthenticated = true;
    res.redirect('/admin');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/admin', requireAuth, (req, res) => {
  res.render('admin', { 
    articles: articles.sort((a, b) => b.date - a.date),
    isAuthenticated: true 
  });
});

app.post('/admin/article', requireAuth, (req, res) => {
  const { title, content, excerpt } = req.body;
  const newArticle = {
    id: articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1,
    title,
    content,
    excerpt,
    author: psychologist.name,
    date: new Date(),
    published: true
  };
  articles.push(newArticle);
  res.redirect('/admin');
});

app.post('/admin/article/:id/edit', requireAuth, (req, res) => {
  const article = articles.find(a => a.id === parseInt(req.params.id));
  if (article) {
    article.title = req.body.title;
    article.content = req.body.content;
    article.excerpt = req.body.excerpt;
  }
  res.redirect('/admin');
});

app.post('/admin/article/:id/delete', requireAuth, (req, res) => {
  const index = articles.findIndex(a => a.id === parseInt(req.params.id));
  if (index !== -1) {
    articles.splice(index, 1);
  }
  res.redirect('/admin');
});

app.post('/admin/article/:id/toggle', requireAuth, (req, res) => {
  const article = articles.find(a => a.id === parseInt(req.params.id));
  if (article) {
    article.published = !article.published;
  }
  res.redirect('/admin');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { isAuthenticated: req.session.isAuthenticated });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});