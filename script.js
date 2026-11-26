/**
 * Mini-jeu Sokoban pour le portfolio
 * Légende des caractères dans les niveaux :
 * '#' : Mur
 * '.' : Cible (emplacement de rangement)
 * '$' : Caisse à pousser
 * '@' : Joueur
 * ' ' : Sol vide
 */

const LEVELS = [
  [
    "#####",
    "#@$.#",
    "#####"
  ],
  [
    "#######",
    "#.    #",
    "#  $  #",
    "#  @  #",
    "#######"
  ],
  [
    "#######",
    "#.   .#",
    "#  $$ #",
    "#  @  #",
    "#######"
  ]
];

// État courant de la partie
let currentLevel = 0;
let grid = [];          // Grille dynamique (contient les caisses '$')
let baseMap = [];       // Grille statique (murs '#' et cibles '.')
let playerPos = [0, 0]; // Coordonnées [ligne, colonne] du joueur
let moveCount = 0;
let isLevelWon = false;

// Références DOM
const boardElement = document.getElementById('board');
const infoElement = document.getElementById('info');

// Vecteurs de déplacement [dy, dx]
const DIRECTIONS = {
  U: [-1, 0],
  D: [1, 0],
  L: [0, -1],
  R: [0, 1]
};

// Association des touches clavier aux directions
const KEY_MAP = {
  ArrowUp: 'U',
  z: 'U',
  Z: 'U',
  ArrowDown: 'D',
  s: 'D',
  S: 'D',
  ArrowLeft: 'L',
  q: 'L',
  Q: 'L',
  ArrowRight: 'R',
  d: 'R',
  D: 'R'
};

/**
 * Charge et initialise un niveau donné par son index
 */
function loadLevel(levelIndex) {
  currentLevel = levelIndex;
  moveCount = 0;
  isLevelWon = false;

  // Conversion des chaînes de caractères en tableaux 2D
  grid = LEVELS[levelIndex].map(row => row.split(''));
  
  // Extraction du décor fixe (murs et cibles)
  baseMap = grid.map(row => 
    row.map(cell => (cell === '#' || cell === '.') ? cell : ' ')
  );

  // Repérage de la position initiale du joueur
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === '@') {
        playerPos = [y, x];
        grid[y][x] = ' '; // On retire le joueur de la grille des objets
      }
    });
  });

  renderBoard();
}

/**
 * Met à jour l'affichage HTML du plateau et vérifie la condition de victoire
 */
function renderBoard() {
  const numCols = grid[0].length;
  boardElement.style.gridTemplateColumns = `repeat(${numCols}, auto)`;

  let htmlContent = '';
  let allBoxesPlaced = true;

  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      let cellClass = '';
      let symbol = '';
      const staticTile = baseMap[y][x];

      if (staticTile === '#') {
        cellClass = 'wall';
      } else {
        if (staticTile === '.') {
          symbol = '✦';
          cellClass = 'goal';
        }

        if (cell === '$') {
          symbol = '📦';
          cellClass = (staticTile === '.') ? 'box-ok' : '';
        } else if (staticTile === '.') {
          // Une cible n'a pas encore de caisse dessus
          allBoxesPlaced = false;
        }

        if (playerPos[0] === y && playerPos[1] === x) {
          symbol = '🧑‍💻';
        }
      }

      htmlContent += `<span class="${cellClass}">${symbol}</span>`;
    });
  });

  boardElement.innerHTML = htmlContent;
  isLevelWon = allBoxesPlaced;

  updateStatusMessage();

  // Passage automatique au niveau suivant après une victoire
  if (isLevelWon) {
    const nextLevel = (currentLevel < LEVELS.length - 1) ? currentLevel + 1 : 0;
    setTimeout(() => loadLevel(nextLevel), 1400);
  }
}

/**
 * Met à jour le texte d'information au-dessus du plateau
 */
function updateStatusMessage() {
  if (isLevelWon) {
    infoElement.textContent = (currentLevel < LEVELS.length - 1)
      ? 'NIVEAU RÉUSSI ! SUIVANT…'
      : 'BRAVO, JEU TERMINÉ !';
  } else {
    infoElement.textContent = `NIVEAU ${currentLevel + 1}/${LEVELS.length} · COUPS : ${moveCount}`;
  }
}

/**
 * Déplace le joueur selon le vecteur (dy, dx) si le mouvement est valide
 */
function movePlayer(dy, dx) {
  if (isLevelWon) return;

  const targetY = playerPos[0] + dy;
  const targetX = playerPos[1] + dx;

  // Collision avec un mur
  if (baseMap[targetY][targetX] === '#') return;

  // Si la case cible contient une caisse, on vérifie si on peut la pousser
  if (grid[targetY][targetX] === '$') {
    const beyondY = targetY + dy;
    const beyondX = targetX + dx;

    // Bloquée par un mur ou une autre caisse
    if (baseMap[beyondY][beyondX] === '#' || grid[beyondY][beyondX] === '$') {
      return;
    }

    // Déplacement de la caisse
    grid[beyondY][beyondX] = '$';
    grid[targetY][targetX] = ' ';
  }

  // Déplacement du joueur
  playerPos = [targetY, targetX];
  moveCount++;
  renderBoard();
}

// Gestion des clics sur la croix directionnelle (D-pad)
document.querySelectorAll('.dpad [data-dir]').forEach(button => {
  button.addEventListener('click', () => {
    const dir = button.dataset.dir;
    if (dir === 'RESET') {
      loadLevel(currentLevel);
    } else {
      const [dy, dx] = DIRECTIONS[dir];
      movePlayer(dy, dx);
    }
  });
});

// Gestion des contrôles clavier quand le plateau a le focus
boardElement.addEventListener('keydown', event => {
  const dir = KEY_MAP[event.key];
  if (dir) {
    event.preventDefault();
    const [dy, dx] = DIRECTIONS[dir];
    movePlayer(dy, dx);
  } else if (event.key.toLowerCase() === 'r') {
    loadLevel(currentLevel);
  }
});

// Lancement du premier niveau au chargement de la page
loadLevel(0);