const app = require('./server');
const PORT = process.env.PORT || 3002;

if (process.argv.length > 2 && process.argv[2] === '--persist') {
  app.load_db(true);
} else {
  app.load_db(false);
}

app.listen(PORT, () => {
  console.log(`Node.js server running on http://localhost:${PORT}`);
});