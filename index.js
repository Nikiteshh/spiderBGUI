const SVGNS = "http://www.w3.org/2000/svg";

window.onload = () => {
  const bgSvg = document.getElementById("bgSvg");
  const cursorRounded = document.querySelector(".glow-cursor");
  //   document.documentElement.style.cursor = "none";
  const bg = {
    height: bgSvg.scrollHeight,
    width: bgSvg.scrollWidth,
    dotRadius: 1,
    dotStroke: 1,
    circleCount: 500,
    lineCount: 10,
    maxLineDistance: 0,
  };

  const randomDots = generateRandomDots(bgSvg, bg); // generate random dots
  let spider = {};
  bgSvg.addEventListener("mousemove", (e) => {
    let x = e.clientX;
    let y = e.clientY;
    setTimeout(() => {
      cursorRounded.style.transform = `translate3d(${x}px, ${y}px, 0)`; // glowing cursor
      spider = generateLines(bgSvg, bg, randomDots, x, y, spider);
    }, 500);
  });

  bgSvg.addEventListener("touchmove", (e) => {
    let x = e.touches[0].clientX;
    let y = e.touches[0].clientY;
    console.log(e);
    setTimeout(() => {
      cursorRounded.style.transform = `translate3d(${x}px, ${y}px, 0)`; // glowing cursor
      spider = generateLines(bgSvg, bg, randomDots, x, y, spider);
    }, 500);
  });

  console.log("JS loaded");
};

function getRandomValue(min, max) {
  return Math.random() * (max - min) + min;
}

function generateRandomDots(parent, config) {
  const dots = [];
  for (let i = 0; i < config.circleCount; i++) {
    const circle = document.createElementNS(SVGNS, "circle");
    const position = {
      cx: getRandomValue(config.width, config.dotStroke),
      cy: getRandomValue(config.height, config.dotStroke),
    };

    circle.setAttributeNS(null, "cx", position.cx);
    circle.setAttributeNS(null, "cy", position.cy);
    circle.setAttributeNS(null, "r", config.dotRadius);
    circle.setAttributeNS(
      null,
      "style",
      `fill: none; stroke: #555; stroke-width: ${config.dotStroke}px`
    );
    dots.push({ ...position, dot: circle });
    bgSvg.appendChild(circle);
  }

  return dots;
}

function getClosestPoints(arr, x, y, count, maxDistance) {
  const distances = [];

  for (let i = 0; i < arr.length; i++) {
    const dist = Math.sqrt(
      Math.pow(arr[i].cx - x, 2) + Math.pow(arr[i].cy - y, 2)
    );
    distances.push({ ...arr[i], distance: dist });
  }

  distances.sort((a, b) => a.distance - b.distance);

  const topTen = distances.slice(0, count);

  return topTen.filter((dist) => {
    if (maxDistance && dist.distance > maxDistance) {
      return false;
    }
    return true;
  });
}

function generateLines(parent, config, points, x, y, spider) {
  const closestPoints = getClosestPoints(
    points,
    x,
    y,
    config.lineCount,
    config.maxLineDistance
  );
  const pathChilds = [];

  // remove previous spider lines
  for (let i = 0; i < spider?.lines?.length; i++) {
    parent.removeChild(spider.lines[i]);
  }
  // remove old point highlights
  for (let i = 0; i < spider?.points?.length; i++) {
    spider.points[i].dot.setAttributeNS(
      null,
      "style",
      `fill: none; stroke: #555; stroke-width: ${config.dotStroke}px`
    );
  }

  for (let i = 0; i < closestPoints.length; i++) {
    const path = document.createElementNS(SVGNS, "path");

    path.setAttributeNS(
      null,
      "d",
      `M ${x} ${y} C ${x + closestPoints[i].distance / 2} ${
        y + closestPoints[i].distance / 2
      }, ${closestPoints[i].cx - closestPoints[i].distance / 2} ${
        closestPoints[i].cy - closestPoints[i].distance / 2
      }, ${closestPoints[i].cx} ${closestPoints[i].cy}`
    );
    path.setAttributeNS(
      null,
      "style",
      "fill: none; stroke: #ffffff; stroke-width:1px"
    );
    closestPoints[i].dot.setAttributeNS(
      null,
      "style",
      `fill: none; stroke: #fff; stroke-width: ${config.dotStroke + 1}px`
    );

    pathChilds.push(path);
    parent.appendChild(path);
  }

  return { lines: pathChilds, points: closestPoints };
}
