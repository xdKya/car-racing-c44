class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leaderBoard = createElement("h2");
    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function (data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state,
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("carro1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("carro2", car2_img);
    car2.scale = 0.07;

    cars = [car1, car2];

    // C38 AP
    fuels = new Group();
    powerCoins = new Group();

    // Adicione o sprite de combustível ao jogo
    this.addSprites(fuels, 4, fuelImage, 0.02);

    // Adicione o sprite de moeda ao jogo
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);
  }

  // C38 AP
  addSprites(spriteGroup, numberOfSprites, spriteImage, scale) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      x = random(width / 2 + 150, width / 2 - 150);
      y = random(-height * 4.5, height - 400);

      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.html("Reiniciar");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 50);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 225, 100);

    this.leaderBoard.html("Placar");
    this.leaderBoard.position(width / 3 - 50, 50);
    this.leaderBoard.class("resetText");

    this.leader1.position(width / 3 - 50, 80);
    this.leader1.class("leadersText");

    this.leader2.position(width / 3 - 50, 130);
    this.leader2.class("leadersText");
  }

  play() {
    this.handleElements();
    this.Resetar();

    Player.getPlayersInfo();
    player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      this.showLeaderBoard();

      //índice da matriz
      var index = 0;
      for (var plr in allPlayers) {
        //adicione 1 ao índice para cada loop
        index = index + 1;

        //use os dados do banco de dados para exibir os carros nas direções x e y
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        // C38  AA
        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handleFuel(index);
          this.handlePowerCoins(index);

          // Altere a posição da câmera na direção y
          //camera.position.x = cars[index - 1].position.x;
          camera.position.y = cars[index - 1].position.y;
        }
      }

      // manipulação dos eventos do teclado
      if (keyIsDown(UP_ARROW)) {
        player.positionY += 10;
        player.update();
      }
      if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
        player.positionX += 5;
        player.update();
        console.log(player.positionX);
      }
      if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
        player.positionX -= 5;
        player.update();
      }

      const chegada = height * 6 - 100;

      if (player.positionY > chegada) {
        gameState = 2;
        player.rank += 1;
        Player.updateCarsAtEnd(player.rank);
        player.update();
        this.showRank();
      }

      drawSprites();
    }
  }

  handleFuel(index) {
    // Adicione o combustível
    cars[index - 1].overlap(fuels, function (collector, collected) {
      player.fuel = 200;
      //collected (coletado) é o sprite no grupo de colecionáveis que desencadeia
      //o evento
      collected.remove();
    });
  }

  handlePowerCoins(index) {
    cars[index - 1].overlap(powerCoins, function (collector, collected) {
      player.score += 21;
      player.update();
      //collected (coletado) é o sprite no grupo de colecionáveis que desencadeia
      //o evento
      collected.remove();
    });
  }

  Resetar() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        gameState: 0,
        playerCount: 0,
        players: {},
        carsAtEnd: 0,
      });
      //att a pagina do jogo
      location.reload();
    });
  }

  showLeaderBoard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);

    // a etiqueta "&emsp;" cria 4 espaços vazios no texto

    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  showRank() {
    swal({
      title: `Incrível!${"\n"}${player.rank}º Lugar! `,
      text: "Você alcançou a linha de chegada com sucesso",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok",
    });
  }
}
