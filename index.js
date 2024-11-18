<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minecraft AFK Bot Manager</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>Minecraft AFK Bot Manager</h1>
    <nav>
      <a href="index.html">Home</a>
      <a href="sessions.html">Active Sessions</a>
    </nav>
  </header>

  <main>
    <h2>Start a Bot</h2>
    <form id="start-bot-form">
      <label>Server Name: <input type="text" name="serverName" required></label><br>
      <label>Server IP: <input type="text" name="serverIP" required></label><br>
      <label>Server Port: <input type="number" name="serverPort" required></label><br>
      <label>Password: <input type="password" name="password" required></label><br>
      <button type="submit">Start Bot</button>
    </form>

    <h2>Stop a Bot</h2>
    <form id="stop-bot-form">
      <label>Server Name: <input type="text" name="serverName" required></label><br>
      <label>Password: <input type="password" name="password" required></label><br>
      <button type="submit">Stop Bot</button>
    </form>
  </main>

  <script>
    const startForm = document.getElementById('start-bot-form');
    const stopForm = document.getElementById('stop-bot-form');

    startForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(startForm);

      await fetch('/start-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });

      alert('Bot started!');
      startForm.reset();
    });

    stopForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(stopForm);

      await fetch('/stop-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });

      alert('Bot stopped!');
      stopForm.reset();
    });
  </script>
</body>
</html>
