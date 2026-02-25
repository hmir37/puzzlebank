/**
 * storage.js — Leaderboard & score persistence
 * Scores are stored in localStorage under the key 'puzzlebank_scores'
 */
const Storage = (() => {
  const KEY = 'puzzlebank_scores';
  const MAX_PER_GAME = 10;

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  /**
   * Add a score entry for a game.
   * Returns { isHighScore, rank } where rank is 1-based position.
   */
  function addScore(gameId, { name, score, level }) {
    const data = load();
    if (!data[gameId]) data[gameId] = [];

    const entry = {
      name: (name || 'Anonymous').slice(0, 20),
      score,
      level,
      date: new Date().toISOString().slice(0, 10),
    };

    data[gameId].push(entry);
    data[gameId].sort((a, b) => b.score - a.score);
    data[gameId] = data[gameId].slice(0, MAX_PER_GAME);

    save(data);

    const rank = data[gameId].findIndex(
      e => e.score === score && e.name === entry.name && e.date === entry.date
    ) + 1;

    return { isHighScore: rank <= 3, rank };
  }

  /** Get top N scores for a game */
  function getScores(gameId, n = MAX_PER_GAME) {
    const data = load();
    return (data[gameId] || []).slice(0, n);
  }

  /** Get the personal best score for a game */
  function getBest(gameId) {
    const scores = getScores(gameId, 1);
    return scores[0] || null;
  }

  /** Aggregate top scores across all games (for the home leaderboard) */
  function getGlobalTop(n = 10) {
    const data = load();
    const GAME_NAMES = {
      sequence:   'Number Sequence',
      memory:     'Memory Grid',
      anagram:    'Anagram',
      arithmetic: 'Arithmetic',
    };
    const all = [];
    for (const [gameId, entries] of Object.entries(data)) {
      for (const e of entries) {
        all.push({ ...e, game: GAME_NAMES[gameId] || gameId });
      }
    }
    all.sort((a, b) => b.score - a.score);
    return all.slice(0, n);
  }

  return { addScore, getScores, getBest, getGlobalTop };
})();
