const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;
const articlesPath = path.join(__dirname, 'data', 'articles.json');

// テンプレートエンジン設定
app.set('view engine', 'ejs');
app.set('views', './views');

// 静的ファイル（CSS・画像など）公開
app.use(express.static('public'));

// フォームデータ受け取り
app.use(bodyParser.urlencoded({ extended: true }));

// 画像アップロード設定
const upload = multer({ dest: 'public/uploads/' });

// JSON読み込み
function loadArticles() {
  if (!fs.existsSync(articlesPath)) return [];
  const raw = fs.readFileSync(articlesPath, 'utf-8');
  return JSON.parse(raw);
}

// JSON保存
function saveArticles(articles) {
  fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2));
}

// ======================== 表示系ルート ========================

// トップページ（社内周知一覧）
app.get('/', (req, res) => {
  const articles = loadArticles();
  res.render('index', { articles });
});

// 問い合わせページ
app.get('/contact', (req, res) => {
  res.render('contact');
});

// 新規投稿ページ
app.get('/new', (req, res) => {
  res.render('new');
});

// 編集ページ
app.get('/edit/:id', (req, res) => {
  const articles = loadArticles();
  const article = articles.find(article => article.id == req.params.id);
  res.render('edit', { article });
});

// ======================== 処理系ルート ========================

// 新規投稿処理
app.post('/new', upload.single('image'), (req, res) => {
  const { title, body } = req.body;
  const image = req.file.filename;

  const articles = loadArticles();
  const newArticle = {
    id: Date.now(),
    title,
    body,
    image,
    updatedAt: new Date().toISOString()
  };

  articles.unshift(newArticle);
  saveArticles(articles);
  res.redirect('/');
});

// 編集処理
app.post('/edit/:id', (req, res) => {
  const { title, body } = req.body;
  let articles = loadArticles();

  articles = articles.map(article => {
    if (article.id == req.params.id) {
      return {
        ...article,
        title,
        body,
        updatedAt: new Date().toISOString()
      };
    }
    return article;
  });

  saveArticles(articles);
  res.redirect('/');
});

// 削除処理
app.get('/delete/:id', (req, res) => {
  let articles = loadArticles();
  articles = articles.filter(article => article.id != req.params.id);
  saveArticles(articles);
  res.redirect('/');
});

// ======================== サーバー起動 ========================

app.listen(PORT, () => {
  console.log(`MyPortalが http://localhost:${PORT} で起動しました`);
});
