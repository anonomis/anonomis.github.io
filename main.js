// Generated by CoffeeScript 1.8.0

/*
window.au = function() {
  document.getElementById("run").click();
  return setTimeout(window.au, 3000);
};
au()
 */

(function() {
  var actions, clockwise, colors, cords, cornerGenerator, ctx, cursor, cvs, dirs, drawGem, drawShape, fps, fps_el, fps_last, fps_now, frameHeight, frameWidth, gem, gems, getCell, grid, hs, isSwap, k, makeGem, mergeCheck, pal, render, renderGridAt, renderSwap, rot, s, shapes, spin, swap, ts, v, vals, x, y, _i, _j;

  window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();

  cvs = document.getElementById("cvs");

  ctx = cvs.getContext("2d");

  frameHeight = 480;

  frameWidth = 640;

  fps = 0;

  fps_now = void 0;

  fps_last = new Date;

  fps_el = document.getElementById("fps");

  cvs.setAttribute("height", frameHeight);

  cvs.setAttribute("width", frameWidth);

  s = 30;

  hs = Math.floor(s / 2);

  ts = Math.floor(s / 4);

  spin = function(modX, modY, step) {
    return {
      ul: [modX, modY],
      ur: [modX + step, modY],
      lr: [modX + step, modY + step],
      ll: [modX, modY + step]
    };
  };

  cords = {
    ul: spin(0, 0, ts),
    ur: spin(s - ts, 0, ts),
    lr: spin(s - ts, s - ts, ts),
    ll: spin(0, s - ts, ts)
  };

  clockwise = ["ul", "ur", "lr", "ll"];

  rot = function(s) {
    return clockwise[(clockwise.indexOf(s) + 1) % 4];
  };

  pal = {
    fill: "0.5",
    ur: "0.3",
    ul: "0.55",
    ll: "0.7",
    lr: "0.55",
    n: "0.4",
    e: "0.4",
    w: "0.6",
    s: "0.6"
  };

  dirs = {
    n: {
      idx: 0,
      ul: cords.ul.ur,
      lr: cords.ur.ll
    },
    e: {
      idx: 1,
      ul: cords.ur.ll,
      lr: cords.lr.ur
    },
    w: {
      idx: 2,
      ul: cords.ul.ll,
      lr: cords.ll.ur
    },
    s: {
      idx: 3,
      ul: cords.ll.ur,
      lr: cords.lr.ll
    }
  };

  shapes = {
    rect: function(ctx, ul, lr) {
      var height, width;
      width = lr[0] - ul[0];
      height = lr[1] - ul[1];
      return ctx.rect(ul[0], ul[1], width, height);
    },
    tri: function(ctx, corners, start) {
      var next;
      ctx.moveTo(corners[start][0], corners[start][1]);
      next = rot(start);
      ctx.lineTo(corners[next][0], corners[next][1]);
      next = rot(rot(next));
      return ctx.lineTo(corners[next][0], corners[next][1]);
    }
  };

  drawShape = function(ctx, shape, corners, dir, opa, color) {
    ctx.beginPath();
    shapes[shape](ctx, corners, dir);
    ctx.closePath();
    ctx.globalAlpha = opa;
    return ctx.fill();
  };

  cornerGenerator = {
    ul: {
      dirs: [0, 2],
      falsefalse: function(ctx) {
        return drawShape(ctx, "tri", cords.ul, "lr", pal.ul);
      },
      falsetrue: function(ctx) {
        return drawShape(ctx, "rect", cords.ul.ul, cords.ul.lr, pal.n);
      },
      truefalse: function(ctx) {
        return drawShape(ctx, "rect", cords.ul.ul, cords.ul.lr, pal.w);
      },
      truetrue: function(ctx) {
        drawShape(ctx, "tri", cords.ul, "ul", pal.ul);
        return drawShape(ctx, "tri", cords.ul, "lr", pal.fill);
      }
    },
    ur: {
      dirs: [0, 1],
      falsefalse: function(ctx) {
        return drawShape(ctx, "tri", cords.ur, "ll", pal.ur);
      },
      falsetrue: function(ctx) {
        return drawShape(ctx, "rect", cords.ur.ul, cords.ur.lr, pal.n);
      },
      truefalse: function(ctx) {
        return drawShape(ctx, "rect", cords.ur.ul, cords.ur.lr, pal.e);
      },
      truetrue: function(ctx) {
        return drawShape(ctx, "tri", cords.ur, "ur", pal.ur);
      },
      truetrue: function(ctx) {
        drawShape(ctx, "tri", cords.ur, "ur", pal.ur);
        return drawShape(ctx, "tri", cords.ur, "ll", pal.fill);
      }
    },
    lr: {
      dirs: [1, 3],
      falsefalse: function(ctx) {
        return drawShape(ctx, "tri", cords.lr, "ul", pal.lr);
      },
      falsetrue: function(ctx) {
        return drawShape(ctx, "rect", cords.lr.ul, cords.lr.lr, pal.e);
      },
      truefalse: function(ctx) {
        return drawShape(ctx, "rect", cords.lr.ul, cords.lr.lr, pal.s);
      },
      truetrue: function(ctx) {
        drawShape(ctx, "tri", cords.lr, "ul", pal.fill);
        return drawShape(ctx, "tri", cords.lr, "lr", pal.lr);
      }
    },
    ll: {
      dirs: [2, 3],
      falsefalse: function(ctx) {
        return drawShape(ctx, "tri", cords.ll, "ur", pal.ll);
      },
      falsetrue: function(ctx) {
        return drawShape(ctx, "rect", cords.ll.ul, cords.ll.lr, pal.w);
      },
      truefalse: function(ctx) {
        return drawShape(ctx, "rect", cords.ll.ul, cords.ll.lr, pal.s);
      },
      truetrue: function(ctx) {
        drawShape(ctx, "tri", cords.ll, "ll", pal.ll);
        return drawShape(ctx, "tri", cords.ll, "ur", pal.fill);
      }
    }
  };

  drawGem = function(ctx, x, y, news, gem, zoom) {
    var dinfo, dir, k, opa, v, xTrans, yTrans;
    zoom = zoom / 2;
    xTrans = x * s;
    yTrans = y * s;
    ctx.save();
    ctx.translate(xTrans, yTrans);
    ctx.fillStyle = "rgb(" + gem.color + ")";
    for (dir in dirs) {
      dinfo = dirs[dir];
      opa = pal.fill;
      if (!news[dinfo.idx]) {
        opa = pal[dir];
      }
      drawShape(ctx, "rect", dinfo.ul, dinfo.lr, opa);
    }
    drawShape(ctx, "rect", cords.ul.lr, cords.lr.ul, pal.fill);
    for (k in cornerGenerator) {
      v = cornerGenerator[k];
      v["" + news[v.dirs[0]] + news[v.dirs[1]]](ctx);
    }
    return ctx.restore();
  };

  makeGem = function(color) {
    return {
      id: _.uniqueId("gem-"),
      color: color
    };
  };

  colors = {
    kendra: "255,0,0",
    starlight: "70,128,70",
    blazeballs: "128,0,128",
    nordicmist: "0,128,128"
  };

  gems = {};

  grid = [];

  var dist = [0,0,0,0];

  for (x = _i = 0; _i <= 5; x = ++_i) {
    grid.push([]);
    for (y = _j = 0; _j <= 5; y = ++_j) {
      vals = [];
      for (k in colors) {
        v = colors[k];
        vals.push(v);
      }
      
      gem = makeGem(vals[Math.floor(Math.random() * vals.length)]);
      grid[x].push(gem);
      gems[gem.id] = gem;
        
    }
  }

  cursor = {
    x: 0,
    y: 0
  };

  actions = {
    "37": function() {
      return cursor.x--;
    },
    "38": function() {
      return cursor.y--;
    },
    "39": function() {
      return cursor.x++;
    },
    "40": function() {
      return cursor.y++;
    },
    "32": function() {
      return window.doSwap();
    }
  };

  $(document).keydown(function(e) {
    var _name;
    console.log(e.keyCode);
    if (typeof actions[_name = e.keyCode] === "function") {
      actions[_name]();
    }
    if (actions[e.keyCode] != null) {
      return e.preventDefault();
    }
  });

  getCell = function(x, y) {
    var _ref;
    if (((_ref = grid[y]) != null ? _ref[x] : void 0) == null) {
      return null;
    }
    return grid[y][x];
  };

  renderGridAt = function(x, y) {
    var news, row, zoom, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    row = grid[y];
    news = [((_ref = getCell(x, y)) != null ? _ref.color : void 0) === ((_ref1 = getCell(x, y - 1)) != null ? _ref1.color : void 0), ((_ref2 = getCell(x, y)) != null ? _ref2.color : void 0) === ((_ref3 = getCell(x + 1, y)) != null ? _ref3.color : void 0), ((_ref4 = getCell(x, y)) != null ? _ref4.color : void 0) === ((_ref5 = getCell(x - 1, y)) != null ? _ref5.color : void 0), ((_ref6 = getCell(x, y)) != null ? _ref6.color : void 0) === ((_ref7 = getCell(x, y + 1)) != null ? _ref7.color : void 0)];
    ctx.save();
    zoom = 0;
    if (row[x] === 1) {
      zoom = Math.sin(fps_now / 1000);
    } else {
      zoom = Math.sin(-fps_now / 1000);
    }
    drawGem(ctx, x, y, news, row[x], zoom);
    return ctx.restore();
  };

  swap = {
    x: 0,
    y: 0,
    prog: 0
  };

  isSwap = function(x, y) {
    if (swap != null) {
      if (x === swap.x || x === swap.x + 1) {
        if (y === swap.y || y === swap.y + 1) {
          return true;
        }
      }
    }
    return false;
  };

  window.doSwap = function() {
    return swap = {
      x: cursor.x,
      y: cursor.y,
      prog: 0
    };
  };

  renderSwap = function(ctx, dt) {
    var angle, pos, scale, swapCords, values;
    ctx.save();
    ctx.translate(s * (swap.x + 1), s * (swap.y + 1));
    angle = swap.prog * (Math.PI / 2);
    scale = 1 - (0.4 * Math.sin(swap.prog * Math.PI));
    ctx.scale(scale, scale);
    ctx.rotate(angle);
    ctx.translate(-s * (swap.x + 1), -s * (swap.y + 1));
    swapCords = spin(swap.x, swap.y, 1);
    for (k in swapCords) {
      pos = swapCords[k];
      renderGridAt(pos[0], pos[1]);
    }
    ctx.restore();
    swap.prog += dt / 1000 * 3;
    if (swap.prog >= 1) {
      values = [getCell(swap.x, swap.y), getCell(swap.x + 1, swap.y), getCell(swap.x, swap.y + 1), getCell(swap.x + 1, swap.y + 1)];
      grid[swap.y][swap.x] = values[2];
      grid[swap.y][swap.x + 1] = values[0];
      grid[swap.y + 1][swap.x] = values[3];
      grid[swap.y + 1][swap.x + 1] = values[1];
      return swap = null;
    }
  };

  mergeCheck = function() {
    var row, _k, _ref, _results;
    _results = [];
    for (y = _k = 0, _ref = grid.length; 0 <= _ref ? _k < _ref : _k > _ref; y = 0 <= _ref ? ++_k : --_k) {
      row = grid[y];
      _results.push((function() {
        var _l, _ref1, _results1;
        _results1 = [];
        for (x = _l = 0, _ref1 = row.length; 0 <= _ref1 ? _l < _ref1 : _l > _ref1; x = 0 <= _ref1 ? ++_l : --_l) {
          _results1.push(gem = getCell(x, y));
        }
        return _results1;
      })());
    }
    return _results;
  };

  render = function() {
    var cursorSlots, dt, row, xTrans, yTrans, _k, _l, _ref, _ref1;
    fps_now = new Date;
    dt = fps_now - fps_last;
    fps = 1000 / dt;
    fps_last = fps_now;
    ctx.save();
    ctx.fillStyle = "lightgray";
    ctx.fillRect(0, 0, frameWidth, frameHeight);
    ctx.translate(10, 10);
    ctx.fillStyle = "white";
    xTrans = cursor.x * s;
    yTrans = cursor.y * s;
    ctx.fillRect(xTrans, yTrans, 2 * s, 2 * s);
    cursorSlots = [];
    for (y = _k = 0, _ref = grid.length; 0 <= _ref ? _k < _ref : _k > _ref; y = 0 <= _ref ? ++_k : --_k) {
      row = grid[y];
      for (x = _l = 0, _ref1 = row.length; 0 <= _ref1 ? _l < _ref1 : _l > _ref1; x = 0 <= _ref1 ? ++_l : --_l) {
        if (!isSwap(x, y)) {
          renderGridAt(x, y);
        } else {
          cursorSlots.push({
            x: x,
            y: y
          });
        }
      }
    }
    if (swap != null) {
      renderSwap(ctx, dt);
    }
    console.log(xTrans, yTrans);
    ctx.restore();
    fps_el.innerHTML = Math.round(fps) + " fps";
    requestAnimFrame(function() {
      render();
    });
  };

  render.call();

  window.gems = gems;

}).call(this);

//# sourceMappingURL=main.js.map
