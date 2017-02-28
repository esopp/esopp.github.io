"use strict";

/**
orientation navigation not supported on large touchscreen devices 
**/
var id_count = 0;
var w_width = 10;

//Models and renders the current dungeon
var Map = React.createClass({
  displayName: "Map",

  dungeon: 1,
  step: true,
  armory: [{ name: "FISH", power: 1 }, { name: "BANANA PEEL", power: 1 }, { name: "STICK", power: 2 }, { name: "DAGGER", power: 3 }, { name: "JAVELIN", power: 4 }, { name: "BROADSWORD", power: 5 }, { name: "RAY GUN", power: 6 }, { name: "LASERSWORD", power: 7 }, { name: "MAGIC ARROW", power: 8 }, { name: "THUNDERBOLT", power: 9 }],
  //this.boss is spawned/given properties in the write_map function, if the dungeon map being written is dungeon 4
  boss: {},
  sq_components: [],
  getInitialState: function getInitialState() {
    var g = this.write_map();
    $('body').keydown(this.input);
    if (/Mobi/i.test(navigator.userAgent)) window.addEventListener('deviceorientation', this.handleOrientation);

    this.write_model(g);
    return {
      grid: g[0],
      p: g[1],
      rms: g[2],
      stats: { health: 100, level: 0, weapon: this.armory[random(2)], next_level: 60 }
    };
  },
  write_map: function write_map() {
    var h = random(50) + 60;
    var w = random(50) + 60;
    var num_of_rooms = 15 + random(10);
    var rooms = [];
    var grid = [];
    for (var r = 0; r < h; r++) {
      var row = [];
      for (var col = 0; col < w; col++) {
        row.push("wall");
      }
      grid.push(row);
    }
    //properties of rm obj: coords of left top corner [row,col], w, h
    var add = function add(rm) {
      for (var row = rm.coords[0] + 1; row < rm.coords[0] + rm.h - 1; row++) {
        for (var col = rm.coords[1] + 1; col < rm.coords[1] + rm.w - 1; col++) {
          grid[row][col] = "floor";
        }
      }
    };
    var has_space = function has_space(rm, spec_coords) {
      for (var row = spec_coords[0]; row < spec_coords[0] + rm.h; row++) {
        for (var col = spec_coords[1]; col < spec_coords[1] + rm.w; col++) {
          if (grid[row][col] == "floor") return false;
        }
      }
      return true;
    };

    for (var i = 0; i < num_of_rooms; i++) {
      //assume the outer blocks of each room are rendered as wall and the inner blocks are rendered as floor
      var dimensions = [random(14) + 8, random(14) + 8]; //[width, height]
      var rm = { w: random(14) + 8, h: random(14) + 8, connections: [] };
      //var coord = [random(h-dimensions[1]), random(w-dimensions[0])]; //[row, col]
      if (i == 0) {
        rm.coords = [random(h - rm.h - 1), random(w - rm.w - 1)];add(rm);
      } else {
        //set coords of rm before add(rm)
        var connect_to = null;
        var temp = []; //push rm elements to temp and delete them from rooms
        var count1 = 0;

        while (connect_to === null && rooms.length > 0) {

          var rm_index = random(rooms.length);
          var rm_2 = rooms[rm_index];

          if (rm_2.connections.length < 4) {
            var open = ["left", "right", "top", "bottom"].filter(function (val) {
              return rm_2.connections.indexOf(val) == -1;
            });
            var count2 = 0;
            while (open.length > 0 && connect_to === null) {
              var wall = open[random(open.length)];

              if (wall == "left") {
                //must have width-1 left in cols to left of rm_2. Must have width-2 between rm_2 and any other floor divs.
                var spec_coords = [rm_2.coords[0], rm_2.coords[1] - rm.w + 1];
                if (spec_coords[1] >= 0 && spec_coords[0] + rm.h < grid.length && has_space(rm, spec_coords)) {
                  rm.coords = spec_coords;
                  rm.connections.push("right");
                  rm_2.connections.push("left");
                  //rooms.push(rm);
                  add(rm);
                  grid[spec_coords[0] + 5][rm_2.coords[1]] = "floor"; // "floor-left";
                  connect_to = "left";
                } //if there is room for rm in the default position next to rm_2

                if (connect_to === null) open = remove(open, open.indexOf("left"));
              } //testing for space on the left wall side of rm_2
              else if (wall == "right") {
                  var spec_coords = [rm_2.coords[0], rm_2.coords[1] + rm_2.w - 1];
                  if (spec_coords[1] < w - rm.w + 1 && spec_coords[0] + rm.h - 1 < grid.length && has_space(rm, spec_coords)) {
                    rm.coords = spec_coords;
                    rm.connections.push("left");
                    rm_2.connections.push("right");
                    add(rm);
                    grid[spec_coords[0] + 5][rm.coords[1]] = "floor";
                    connect_to = "right";
                  } //if there is room for rm in the default position next to rm_2

                  if (connect_to === null) open = remove(open, open.indexOf("right"));
                } else if (wall == "top") {
                  var spec_coords = [rm_2.coords[0] - rm.h + 1, rm_2.coords[1]];
                  if (spec_coords[0] >= 0 && spec_coords[1] + rm.w - 1 < grid[0].length && has_space(rm, spec_coords)) {
                    rm.coords = spec_coords;
                    rm.connections.push("bottom");
                    rm_2.connections.push("top");
                    add(rm);
                    grid[rm_2.coords[0]][rm.coords[1] + 5] = "floor"; //"floor-top";
                    connect_to = "top";
                  } //if there is room for rm in the default position next to rm_2

                  if (connect_to === null) open = remove(open, open.indexOf("top"));
                } else {
                  //wall == bottom
                  var spec_coords = [rm_2.coords[0] + rm_2.h - 1, rm_2.coords[1]];
                  if (spec_coords[0] + rm.h - 1 < grid.length && spec_coords[1] + rm.w - 1 < grid[0].length && has_space(rm, spec_coords)) {
                    rm.coords = spec_coords;
                    rm.connections.push("top");
                    rm_2.connections.push("bottom");
                    add(rm);
                    grid[rm.coords[0]][rm.coords[1] + 5] = "floor";
                    connect_to = "bottom";
                  } //if there is room for rm in the default position next to rm_2
                  if (connect_to === null) open = remove(open, open.indexOf("bottom"));
                }
            }
          } //if there are walls without connections in rm_2                                               
          if (connect_to === null) {
            temp.push(rm_2);rooms = remove(rooms, rm_index);
          } //if space next to rm_2 not found, temporarily remove rm_2 from the array, rooms                                              
        } //(while connect_to == null) try to fit a new room on the map next to rm_2
        if (rooms.length == 0) rooms = temp;else rooms = temp.concat(rooms);
      } //randomly iterate through rm elements in rooms
      if (rm.connections.length > 0 || rooms.length == 0) rooms.push(rm);
    } //for loop to make rooms
    var pl = this.drop(rooms, grid);
    grid[pl[0]][pl[1]] = "player";
    var health_num = random(4) + 5;
    for (var count = 0; count < health_num; count++) {
      var h = this.drop(rooms, grid);
      grid[h[0]][h[1]] = "health";
    }
    var enemy_num = random(4) + 5;
    for (var count = 0; count < enemy_num; count++) {
      var h = this.drop(rooms, grid);
      grid[h[0]][h[1]] = "enemy";
    }
    var w = this.drop(rooms, grid);
    grid[w[0]][w[1]] = "weapon";
    if (this.dungeon < 4) {
      var p = this.drop(rooms, grid);
      grid[p[0]][p[1]] = "portal";
    } else {
      var b = this.drop_boss(rooms, grid);
      grid[b[0]][b[1]] = "boss";
      grid[b[0]][b[1] + 1] = "boss";
      grid[b[0] + 1][b[1]] = "boss";
      grid[b[0] + 1][b[1] + 1] = "boss";
      this.boss = {
        health: 500,
        attack: function attack() {
          return 5 + random(10) * 4;
        },
        take_damage: function take_damage(attack) {
          this.health -= attack;
          if (this.health <= 0) {
            return true;
          } else return false;
        }
      };
    }
    return [grid, pl, rooms];
  },
  redraw: function redraw() {
    var g = this.write_map();
    this.write_model(g);
    this.setState({ grid: g[0], p: g[1], rms: g[2] });
  },
  write_model: function write_model(g) {
    this.sq_components = [];
    for (var r in g[0]) {
      var row = [];
      for (var c in g[0][r]) {
        if (g[0][r][c] == "enemy") row.push({
          health: 30 * (1 + random(this.dungeon)),
          level: this.dungeon,
          row: r,
          col: c,
          attack: function attack() {
            return 5 + random(3 + this.level) * 4;
          },
          take_damage: function take_damage(attack) {
            console.log("damage?");
            this.health -= attack;console.log("enemy health", attack, this.health);
            if (this.health <= 0) return true;else return false;
          }
        });else row.push("space");
      }
      this.sq_components.push(row);
    }
  },
  drop: function drop(rooms, grid) {
    var rm = rooms[random(rooms.length)];
    var coords = [random(rm.h - 2) + rm.coords[0] + 1, random(rm.w - 2) + rm.coords[1] + 1];
    if (grid[coords[0]][coords[1]] == "floor") {
      return coords;
    } else {
      for (var row = coords[0] + 1; row < rm.h + rm.coords[0] - 1; row++) {
        for (var col = coords[1] + 1; col < rm.w + rm.coords[1] - 1; col++) {
          if (grid[row][col] == "floor") return [row, col];
        }
      }
      return coords;
    }
  },
  drop_boss: function drop_boss(rooms, grid) {
    //RETURNS COORDS OF TOP LEFT CORNER OF A BOSS THAT IS ASSUMED TO BE TWO UNITS SQUARED
    var rm = rooms[random(rooms.length)];
    var coords = [random(rm.h - 3) + rm.coords[0] + 1, random(rm.w - 3) + rm.coords[1] + 1];
    if (grid[coords[0]][coords[1]] == "floor" && grid[coords[0]][coords[1] + 1] == "floor" && grid[coords[0] + 1][coords[1]] == "floor" && grid[coords[0] + 1][coords[1] + 1] == "floor") {
      return coords;
    } else {
      for (var row = coords[0] + 1; row < rm.h + rm.coords[0] - 1; row++) {
        for (var col = coords[1] + 1; col < rm.w + rm.coords[1] - 1; col++) {
          if (grid[row][col] == "floor" && grid[row][col + 1] == "floor" && grid[row + 1][col] == "floor" && grid[row + 1][col + 1] == "floor") return [row, col];
        }
      }
      return coords;
    }
  },
  player_move: function player_move(row, col) {
    //param values should be 1, -1, or 0
    var start = this.state.p;
    var end = [start[0] + row, start[1] + col];
    var temp = this.state.grid;
    if (temp[end[0]][end[1]] == "floor") {
      temp[start[0]][start[1]] = "floor";
      temp[end[0]][end[1]] = "player";
      this.setState({ grid: temp });
      this.setState({ p: end });
    } else if (temp[end[0]][end[1]] == "health") {
      temp[start[0]][start[1]] = "floor";
      temp[end[0]][end[1]] = "player";
      var s = this.state.stats;
      s.health += 10 * (1 + random(this.dungeon + 1));
      this.setState({ stats: s });
      this.setState({ grid: temp });
      this.setState({ p: end });
    } else if (temp[end[0]][end[1]] == "enemy" || temp[end[0]][end[1]] == "boss") {
      this.battle(end[0], end[1]);
    } else if (temp[end[0]][end[1]] == "weapon") {
      temp[start[0]][start[1]] = "floor";
      temp[end[0]][end[1]] = "player";
      var s = this.state.stats;
      s.weapon = this.armory[this.dungeon * 2 + random(2)];
      this.setState({ stats: s });
      this.setState({ grid: temp });
      this.setState({ p: end });
    } else if (temp[end[0]][end[1]] == "portal") {
      this.dungeon++;
      this.redraw();
    }
  },
  input: function input(e) {
    if (e.which == 37) this.player_move(0, -1);else if (e.which == 38) this.player_move(-1, 0);else if (e.which == 39) this.player_move(0, 1);else if (e.which == 40) this.player_move(1, 0);
  },
  handleOrientation: function handleOrientation(e) {
    if (this.step) {
      this.step = false;
      var oy = e.beta > 90 ? 180 : e.beta < -90 ? 0 : e.beta + 90;
      var ox = e.gamma + 90;
      if (ox > 95) this.player_move(0, 1);else if (ox < 85) this.player_move(0, -1);

      if (oy > 140) this.player_move(1, 0);else if (oy < 130) this.player_move(-1, 0);
    } else this.step = true;
  },
  battle: function battle(row, col) {
    var enemy;
    if (this.state.grid[row][col] == "enemy") enemy = this.sq_components[row][col];else {
      enemy = this.boss;
    }
    var selfdestruct = enemy.take_damage((this.state.stats.level + this.state.stats.weapon.power) * random(10) + 5);
    if (!selfdestruct) {
      var s = this.state.stats;
      s.health -= enemy.attack();
      if (s.health <= 0) {
        alert("YOU DIED!!! D:");
        this.dungeon = 1;
        this.redraw();
        this.setState({ stats: { health: 100, level: 0, weapon: this.armory[random(2)], next_level: 60 } });
      } else {
        this.setState({ stats: s });
      }
    } else this.destruct(row, col);
  },
  destruct: function destruct(row, col) {
    var s = this.state.stats;
    if (this.sq_components[row][col] != "space") {
      this.sq_components[row][col] = "space";
      this.state.grid[row][col] = "floor";
      s.next_level -= 30 * (1 + random(this.dungeon + 1));
      if (s.next_level <= 0) {
        s.level++;
        s.next_level = s.level * 60 + 30;
      }
    } else {
      this.state.grid[row][col] = "floor";
      this.state.grid[row + 1][col] = "floor";
      this.state.grid[row][col + 1] = "floor";
      this.state.grid[row + 1][col + 1] = "floor";
      alert("YOU DEFEATED THE BOSS!");
      this.dungeon = 1;
      this.redraw();
      s = { health: 100, level: 0, weapon: this.armory[random(2)], next_level: 60 };
    }
    this.setState({ stats: s });
  },
  render: function render() {
    var ex = this.state.grid;
    var veiw = [];
    var pos = this.state.p;
    var bounds = { top: pos[1] - w_width >= 0 ? pos[1] - w_width : 0, bottom: pos[1] - w_width > 0 ? pos[1] + w_width < ex[0].length ? pos[1] + w_width : ex[0].length - 1 : w_width * 2, left: pos[0] - w_width >= 0 ? pos[0] - w_width : 0, right: pos[0] - w_width > 0 ? pos[0] + w_width < ex.length ? pos[0] + w_width : ex.length - 1 : w_width * 2 };
    var rows = [];

    for (var row in ex) {
      rows.push(React.createElement(Row, { squares: ex[row] }));
    }
    for (var row = bounds.left; row <= bounds.right; row++) {
      var temp = [];
      for (var col = bounds.top; col <= bounds.bottom; col++) {
        temp.push(ex[row][col]);
      }
      veiw.push(React.createElement(Row, { squares: temp }));
    }
    var s = this.state.stats;

    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { className: "text-center stats" },
        React.createElement(
          "p",
          null,
          "Health: ",
          s.health,
          "hp",
          React.createElement(
            "span",
            null,
            "Level: ",
            s.level
          ),
          React.createElement(
            "span",
            null,
            "Level Up: ",
            s.next_level,
            "xp"
          ),
          React.createElement(
            "span",
            null,
            "Weapon: ",
            s.weapon.name
          ),
          "Dungeon: ",
          this.dungeon
        )
      ),
      React.createElement(
        "div",
        { className: "text-center map" },
        veiw
      ),
      React.createElement(
        "div",
        null,
        "coded by ",
        React.createElement(
          "a",
          { href: "http://codepen.io/esopp", target: "_blank" },
          "esopp"
        )
      )
    );
  }
});

var Row = React.createClass({
  displayName: "Row",

  render: function render() {

    var sqrs = [];

    for (var s in this.props.squares) {
      sqrs.push(React.createElement(Square, { "class": this.props.squares[s] }));
    }

    return React.createElement(
      "div",
      { className: "text-center row" },
      sqrs
    );
  }
});

var Square = React.createClass({
  displayName: "Square",

  render: function render() {
    return React.createElement("div", { className: "sqr " + this.props.class });
  }
});

//RANDOM returns a random number between 0 and the param, range (inclusive of 0, not inclusive of range)
function random(range) {
  return Math.floor(Math.random() * range);
}

function remove(arr, index) {
  if (index != -1) {
    var temp = arr.slice(0, index).concat(arr.slice(index + 1, arr.length));
    return temp;
  } else return arr;
}

ReactDOM.render(React.createElement(Map, null), document.getElementById('play'));
