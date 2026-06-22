// Using native global fetch

const url = 'https://jcfrlevtrnhrmyovmuza.supabase.co/rest/v1/';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnJsZXZ0cm5ocm15b3ZtdXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTk3MDgsImV4cCI6MjA5NjE5NTcwOH0.hvx7Xqt7q54VG5DEu9QtOqEbESbceRpeOMu_9ENVs7s';

async function getHeaders() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': anonKey
      }
    });
    console.log("Status:", res.status);
    console.log("Headers:");
    for (const [key, value] of res.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
  } catch (err) {
    console.error(err);
  }
}

getHeaders();
