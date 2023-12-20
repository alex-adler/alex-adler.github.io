(() => {
  // space_time/data/celestial_data.js
  var space_time = {
    Earth: {
      name: "Earth",
      dayLength_ms: 864e5,
      yearLength_ms: 31558149e3,
      yearLength_hd: 365,
      hDayLength_ms: 864e5,
      weekLength_d: 7,
      weekLength_hd: 7,
      hYearLength_ms: 31536e6,
      monthCount: 12,
      nominalMonthLength_hd: 30,
      nominalMonthLength_ms: 2592e6,
      leapYearFreq_hd: [4, 158],
      leapYearBlocks_ms: [1262304e5, 4986144e6],
      monthRemainder_hd: 5,
      initialWeekDay: 6,
      initialYearProgress: 0,
      GM_km3_s2: 398600.435436,
      radius_km: 6378.137,
      surface_gravity_ms: 9.798285322749217,
      semiMajorAxis_0_km: 1496534962738141e-7,
      eccentricity_0: 0.01704239718110438,
      inclination_0_deg: 2668809336274974e-19,
      longitudOfAscendingNode_0_deg: 163.9748712430063,
      argumentOfPeriapsis_0_deg: 297.7671795415902,
      trueAnomaly_0_deg: 358.1260865474801,
      semiMajorAxis_km_Cy: 0,
      eccentricity_Cy: 0,
      inclination_sec_Cy: 0,
      longitudOfAscendingNode_sec_Cy: 0,
      argumentOfPeriapsis_sec_Cy: 0,
      trueAnomaly_sec_Cy: 0
    },
    Mars: {
      name: "Mars",
      dayLength_ms: 88775e3,
      yearLength_ms: 59266496e3,
      yearLength_hd: 667,
      hDayLength_ms: 88775e3,
      weekLength_d: 7,
      weekLength_hd: 7,
      hYearLength_ms: 59212925e3,
      monthCount: 24,
      nominalMonthLength_hd: 27,
      nominalMonthLength_ms: 2396925e3,
      leapYearFreq_hd: [2, 10],
      leapYearBlocks_ms: [118514625e3, 5926619e5],
      monthRemainder_hd: 19,
      initialWeekDay: 0,
      initialYearProgress: 0,
      GM_km3_s2: 42828.375214,
      radius_km: 3396.19,
      surface_gravity_ms: 3.7131940089349422,
      semiMajorAxis_0_km: 2279390120013493e-7,
      eccentricity_0: 0.0933146065415545,
      inclination_0_deg: 1.849876654038142,
      longitudOfAscendingNode_0_deg: 49.56199905920329,
      argumentOfPeriapsis_0_deg: 286.5373583154345,
      trueAnomaly_0_deg: 23.02024685501411,
      semiMajorAxis_km_Cy: 0,
      eccentricity_Cy: 0,
      inclination_sec_Cy: 0,
      longitudOfAscendingNode_sec_Cy: 0,
      argumentOfPeriapsis_sec_Cy: 0,
      trueAnomaly_sec_Cy: 0
    },
    Ceres: {
      name: "Ceres",
      dayLength_ms: 32667e3,
      yearLength_ms: 145423789e3,
      yearLength_hd: 1712,
      weekLength_d: 13,
      weekLength_hd: 5,
      hDayLength_ms: 84934e3,
      hYearLength_ms: 145407008e3,
      monthCount: 84,
      nominalMonthLength_hd: 20,
      nominalMonthLength_ms: 169868e4,
      leapYearFreq_hd: [6, 33],
      leapYearBlocks_ms: [872526982e3, 4798940868e3],
      monthRemainder_hd: 32,
      initialWeekDay: 0,
      initialYearProgress: 0
    },
    Europa: {
      name: "Europa",
      dayLength_ms: 306822e3,
      yearLength_ms: 374335776e3,
      yearLength_hd: 4270,
      weekLength_d: 2,
      weekLength_hd: 7,
      hDayLength_ms: 87663e3,
      hYearLength_ms: 37432101e4,
      monthCount: 152,
      nominalMonthLength_hd: 28,
      nominalMonthLength_ms: 2454564e3,
      leapYearFreq_hd: [6, 564],
      leapYearBlocks_ms: [2246013723e3, 211125377625e3],
      monthRemainder_hd: 14,
      initialWeekDay: 0,
      initialYearProgress: 0
    },
    Ganymede: {
      name: "Ganymede",
      dayLength_ms: 618153e3,
      yearLength_ms: 374335776e3,
      yearLength_hd: 4239,
      weekLength_d: 1,
      weekLength_hd: 7,
      hDayLength_ms: 88307e3,
      hYearLength_ms: 374333373e3,
      monthCount: 148,
      nominalMonthLength_hd: 28,
      nominalMonthLength_ms: 2472596e3,
      leapYearFreq_hd: [37, 5410],
      leapYearBlocks_ms: [13850423108e3, 2025156529059e3],
      monthRemainder_hd: 95,
      initialWeekDay: 0,
      initialYearProgress: 0
    },
    Callisto: {
      name: "Callisto",
      dayLength_ms: 1441931e3,
      yearLength_ms: 374335776e3,
      yearLength_hd: 4413,
      weekLength_d: 1,
      weekLength_hd: 17,
      hDayLength_ms: 84819e3,
      hYearLength_ms: 374306247e3,
      monthCount: 64,
      nominalMonthLength_hd: 68,
      nominalMonthLength_ms: 5767692e3,
      leapYearFreq_hd: [3, 68],
      leapYearBlocks_ms: [112300356e4, 25454775633e3],
      monthRemainder_hd: 61,
      initialWeekDay: 0,
      initialYearProgress: 0
    },
    Titan: {
      name: "Titan",
      dayLength_ms: 1377648e3,
      yearLength_ms: 929596607e3,
      yearLength_hd: 10796,
      weekLength_d: 1,
      weekLength_hd: 16,
      hDayLength_ms: 86103e3,
      hYearLength_ms: 929567988e3,
      monthCount: 168,
      nominalMonthLength_hd: 64,
      nominalMonthLength_ms: 5510592e3,
      leapYearFreq_hd: [4, 13],
      leapYearBlocks_ms: [3718358055e3, 12084728256e3],
      monthRemainder_hd: 44,
      initialWeekDay: 0,
      initialYearProgress: 0
    },
    Enceladus: {
      name: "Enceladus",
      dayLength_ms: 118386e3,
      yearLength_ms: 929596607e3,
      yearLength_hd: 10993,
      weekLength_d: 5,
      weekLength_hd: 7,
      hDayLength_ms: 84561e3,
      hYearLength_ms: 929579073e3,
      monthCount: 392,
      nominalMonthLength_hd: 28,
      nominalMonthLength_ms: 2367708e3,
      leapYearFreq_hd: [5, 136],
      leapYearBlocks_ms: [4647979926e3, 126425121636e3],
      monthRemainder_hd: 17,
      initialWeekDay: 0,
      initialYearProgress: 0
    },
    Titania: {
      name: "Titania",
      dayLength_ms: 752218e3,
      yearLength_ms: 26514864e5,
      yearLength_hd: 31724,
      weekLength_d: 1,
      weekLength_hd: 9,
      hDayLength_ms: 83579e3,
      hYearLength_ms: 2651460196e3,
      monthCount: 880,
      nominalMonthLength_hd: 36,
      nominalMonthLength_ms: 3008844e3,
      leapYearFreq_hd: [4, 16],
      leapYearBlocks_ms: [10605924363e3, 42423781031e3],
      monthRemainder_hd: 44,
      initialWeekDay: 0,
      initialYearProgress: 0
    },
    Triton: {
      name: "Triton",
      dayLength_ms: 50776e4,
      yearLength_ms: 51997248e5,
      yearLength_hd: 61443,
      weekLength_d: 1,
      weekLength_hd: 6,
      hDayLength_ms: 84626e3,
      hYearLength_ms: 5199675318e3,
      monthCount: 2560,
      nominalMonthLength_hd: 24,
      nominalMonthLength_ms: 2031024e3,
      leapYearFreq_hd: [2, 12],
      leapYearBlocks_ms: [10399435262e3, 62396696198e3],
      monthRemainder_hd: 3,
      initialWeekDay: 0,
      initialYearProgress: 0
    }
  };

  // transit/map.ts
  var AU_km = 1496e5;
  var Orbit = class {
    constructor(a_km, e, i_deg, longitudeOfAscendingNode_deg, argumentOfPeriapsis_deg, meanAnomaly_deg, GM_km3_s2, scale) {
      this.semiMajorAxis_km = a_km;
      this.eccentricity = e;
      this.inclination_deg = i_deg;
      this.longitudOfAscendingNode_deg = longitudeOfAscendingNode_deg;
      this.argumentOfPeriapsis_deg = argumentOfPeriapsis_deg;
      this.meanAnomaly_0_deg = meanAnomaly_deg;
      this.semiMinorAxis_km = a_km * (1 - this.eccentricity);
      this.GM_km3_s2 = GM_km3_s2;
      this.scale = scale;
    }
    draw(canvas, ctx) {
      if (this.semiMajorAxis_km == void 0)
        return;
      ctx.beginPath();
      ctx.ellipse(
        0.5 * canvas.width + Math.cos(degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg)) * this.eccentricity * this.semiMajorAxis_km * this.scale,
        0.5 * canvas.height + Math.sin(degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg)) * this.eccentricity * this.semiMajorAxis_km * this.scale,
        this.semiMajorAxis_km * this.scale,
        this.semiMinorAxis_km * this.scale,
        degToRad(this.longitudOfAscendingNode_deg + this.argumentOfPeriapsis_deg),
        0,
        2 * Math.PI
      );
      ctx.strokeStyle = "white";
      ctx.stroke();
    }
    keplersEquation(E_rad) {
      return E_rad - this.eccentricity * Math.sin(E_rad) - radToDeg(this.meanAnomaly_deg);
    }
    updatePosition(t_ms) {
      this.meanAnomaly_deg = this.meanAnomaly_0_deg + t_ms * (this.GM_km3_s2 / this.semiMajorAxis_km ** 3) ** 0.5;
      let eccentricAnomaly_rad = newtonRaphson(this.keplersEquation.bind(this), degToRad(this.meanAnomaly_deg), null);
      let trueAnomaly_rad = 2 * Math.atan2(
        (1 + this.eccentricity) ** 0.5 * Math.sin(eccentricAnomaly_rad / 2),
        (1 - this.eccentricity) ** 0.5 * Math.cos(eccentricAnomaly_rad / 2)
      );
      let distanceToCenter = this.semiMajorAxis_km * (1 - this.eccentricity * Math.cos(eccentricAnomaly_rad));
      console.log(
        "Mean anomaly: " + this.meanAnomaly_deg + " deg | Eccentric anomaly: " + radToDeg(eccentricAnomaly_rad) % 360 + " deg | Radius = " + distanceToCenter
      );
      let positionVector_perifocalFrame = new Array(3);
      positionVector_perifocalFrame[0] = distanceToCenter * Math.cos(trueAnomaly_rad);
      positionVector_perifocalFrame[1] = distanceToCenter * Math.sin(trueAnomaly_rad);
      positionVector_perifocalFrame[2] = 0;
      let argumentOfPeriapsis_rad = degToRad(this.argumentOfPeriapsis_deg);
      let inclination_rad = degToRad(this.inclination_deg);
      let longitudOfAscendingNode_rad = degToRad(this.longitudOfAscendingNode_deg);
      let positionVector_inertialFrame = new Array(3);
      positionVector_inertialFrame[0] = positionVector_perifocalFrame[0] * (Math.cos(argumentOfPeriapsis_rad) * Math.cos(longitudOfAscendingNode_rad) - Math.sin(argumentOfPeriapsis_rad) * Math.cos(inclination_rad) * Math.sin(longitudOfAscendingNode_rad) - positionVector_perifocalFrame[1] * (Math.sin(argumentOfPeriapsis_rad) * Math.cos(longitudOfAscendingNode_rad) + Math.cos(argumentOfPeriapsis_rad) * Math.cos(inclination_rad) * Math.sin(longitudOfAscendingNode_rad)));
      positionVector_inertialFrame[1] = positionVector_perifocalFrame[0] * (Math.cos(argumentOfPeriapsis_rad) * Math.cos(longitudOfAscendingNode_rad) + Math.sin(argumentOfPeriapsis_rad) * Math.cos(inclination_rad) * Math.sin(longitudOfAscendingNode_rad) + positionVector_perifocalFrame[1] * (Math.cos(argumentOfPeriapsis_rad) * Math.cos(inclination_rad) * Math.cos(longitudOfAscendingNode_rad) - Math.sin(argumentOfPeriapsis_rad) * Math.sin(longitudOfAscendingNode_rad)));
      positionVector_inertialFrame[2] = positionVector_perifocalFrame[0] * (Math.sin(argumentOfPeriapsis_rad) * Math.sin(inclination_rad)) - positionVector_perifocalFrame[1] * (Math.cos(argumentOfPeriapsis_rad) * Math.sin(inclination_rad));
      console.log(
        "Perifocal: " + positionVector_perifocalFrame[0] / AU_km + " AU | " + positionVector_perifocalFrame[1] / AU_km + " AU | " + positionVector_perifocalFrame[2] + " km"
      );
      console.log(
        "Inertial: " + positionVector_inertialFrame[0] / AU_km + " AU | " + positionVector_inertialFrame[1] / AU_km + " AU | " + positionVector_inertialFrame[2] + " km"
      );
    }
  };
  function newtonRaphson(f, x0, options) {
    var x1, y, yp, tol, maxIter, iter, yph, ymh, yp2h, ym2h, h, hr, verbose, eps;
    let fp = null;
    if (typeof fp !== "function") {
      options = x0;
      x0 = fp;
      fp = null;
    }
    options = options || {};
    tol = options.tolerance === void 0 ? 1e-7 : options.tolerance;
    eps = options.epsilon === void 0 ? 2220446049250313e-31 : options.epsilon;
    maxIter = options.maxIterations === void 0 ? 20 : options.maxIterations;
    h = options.h === void 0 ? 1e-4 : options.h;
    verbose = options.verbose === void 0 ? false : options.verbose;
    hr = 1 / h;
    iter = 0;
    while (iter++ < maxIter) {
      y = f(x0);
      yph = f(x0 + h);
      ymh = f(x0 - h);
      yp2h = f(x0 + 2 * h);
      ym2h = f(x0 - 2 * h);
      yp = (ym2h - yp2h + 8 * (yph - ymh)) * hr / 12;
      if (Math.abs(yp) <= eps * Math.abs(y)) {
        if (verbose) {
          console.log("Newton-Raphson: failed to converged due to nearly zero first derivative");
        }
        return 0;
      }
      x1 = x0 - y / yp;
      if (Math.abs(x1 - x0) <= tol * Math.abs(x1)) {
        if (verbose) {
          console.log("Newton-Raphson: converged to x = " + x1 + " after " + iter + " iterations");
        }
        return x1;
      }
      x0 = x1;
    }
    if (verbose) {
      console.log("Newton-Raphson: Maximum iterations reached (" + maxIter + ")");
    }
    return 0;
  }
  function degToRad(degrees) {
    return degrees * (Math.PI / 180);
  }
  function radToDeg(radians) {
    return radians * (180 / Math.PI);
  }

  // transit/transit.ts
  var AU_km2 = 1496e5;
  function generate() {
    let table = document.getElementById("output-table");
    let dropDown = document.getElementById("location-drop-down");
    let canvas = document.getElementById("orbital-canvas");
    let orbits = [];
    for (const key in space_time) {
      let opt = document.createElement("option");
      let body = space_time[key];
      opt.value = key;
      opt.innerHTML = body.name;
      dropDown.appendChild(opt);
      orbits.push(
        new Orbit(
          body.semiMajorAxis_0_km,
          body.eccentricity_0,
          body.inclination_0_deg,
          body.longitudOfAscendingNode_0_deg,
          body.argumentOfPeriapsis_0_deg,
          body.trueAnomaly_0_deg,
          body.GM_km3_s2,
          canvas.clientWidth / (5 * AU_km2)
        )
      );
      console.log(body.name);
      console.log(orbits.at(-1));
      orbits.at(-1).updatePosition(0);
      orbits.at(-1).updatePosition(Date.now() - 9466848e5);
    }
    generateCanvas(canvas, orbits);
  }
  function generateCanvas(canvas, orbits) {
    if (!canvas.getContext)
      return;
    let ctx = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio;
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(canvas.width / 2, canvas.height / 2, 1, 0, 2 * Math.PI);
    ctx.fill(this);
    orbits.forEach((o) => {
      o.draw(canvas, ctx);
    });
  }
  window.onload = function() {
    generate();
  };
})();
