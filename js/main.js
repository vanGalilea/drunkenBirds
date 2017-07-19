var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var cursors;
var bird;
var beers;

var cannon;
var anim;
var ground;

var explosion;
var shatter;

var score = [];
var scoreText;
var bonusScore = 0;
var bonusScoreText;

function preload() {
  game.load.image('background', 'assets/background.png');
  game.load.image('ground', 'assets/platform.png');
  game.load.image('beer', 'assets/beerbottle.png');
  game.load.image('bird', 'assets/angrybird.png');
  game.load.spritesheet('cannon', 'assets/cannonRight.png', 100, 100);
  game.load.audio('explosion', 'assets/audio/explosion.mp3');
  game.load.audio('shatter', 'assets/audio/glass-shatter-mix.mp3');
}

function create() {
  game.physics.startSystem(Phaser.Physics.P2JS);
  game.physics.p2.setImpactEvents(true);
  game.physics.p2.gravity.y = 300;

  game.add.sprite(0, 0, 'background');

  var birdCollisionGroup = game.physics.p2.createCollisionGroup();
  var beerCollisionGroup = game.physics.p2.createCollisionGroup();
  var groundCollisionGroup = game.physics.p2.createCollisionGroup();
  game.physics.p2.updateBoundsCollisionGroup();

  beers = game.add.group();
  beers.enableBody = true;
  beers.physicsBodyType = Phaser.Physics.P2JS;

  for (var i = 0; i < 10; i++) {
    var beer;
    if (i < 4) beer = beers.create(game.world.width-150 - i * 30, game.world.height - 130, 'beer');
    if (i > 3 && i < 7) beer = beers.create(game.world.width-165 - (i - 4) * 30, game.world.height - 230, 'beer');
    if (i > 6 && i < 9) beer = beers.create(game.world.width-180 - (i - 7) * 30, game.world.height - 330, 'beer');
    if (i > 8)	beer = beers.create(game.world.width-195, game.world.height - 430, 'beer');

    beer.body.setRectangle(20, 80);
    beer.body.setCollisionGroup(beerCollisionGroup);
    beer.body.collides([beerCollisionGroup, groundCollisionGroup, birdCollisionGroup]);
  }

  ground = game.add.sprite(415, game.world.height - 45, 'ground');
  ground.scale.setTo(1.06, 1);
  game.physics.p2.enable(ground);
  ground.body.static = true;
  ground.body.setCollisionGroup(groundCollisionGroup);
  ground.body.collides([beerCollisionGroup, birdCollisionGroup]);

  bird = game.add.sprite(110, game.world.height - 150, 'bird');
  game.physics.p2.enable(bird);
  bird.body.setCircle(50);
  bird.body.setCollisionGroup(birdCollisionGroup);
  bird.body.collideWorldBounds = true;
  bird.body.collides(groundCollisionGroup, handleBirdGroundCollision, this);
  bird.body.collides(beerCollisionGroup, handleBirdBeerCollision, this);

  cannon = game.add.sprite(50, game.world.height - 200, 'cannon', 0);
  cannon.scale.set(2);
  cannon.smoothed = false;
  anim = cannon.animations.add('shoot');

  scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
  bonusScoreText = game.add.text(16, 45, 'Bonus: 0', { fontSize: '32px', fill: '#000' });
  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)

  explosion = game.add.audio('explosion');
  shatter = game.add.audio('shatter');
}

function update() {
  if (fireButton.isDown){
    anim.play(10, true);
    explosion.play();
    bird.body.moveRight(game.rnd.integerInRange(100, 500));
    bird.body.moveUp(game.rnd.integerInRange(100, 500));
    anim.play(10, false);
  }
}

function handleBirdBeerCollision(bird, beer) {
  if(beer.id !== score[score.length-1]){
    shatter.play();
    score = score.concat(beer.id);
    scoreText.text = 'Score: ' + score.length * 10;
  }
}

function handleBirdGroundCollision(bird, ground) {
  if(bird.x > 150) game.input.destroy()
  bonusScore = beers.children.filter(function(beer){ return beer.rotation > 1 || beer.rotation < -1 })
  bonusScore = bonusScore.length * 10;
  bonusScoreText.text = 'Bonus: ' + bonusScore;
}
