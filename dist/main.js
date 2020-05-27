/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.tsx");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.tsx":
/*!***********************!*\
  !*** ./src/index.tsx ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tf = __webpack_require__(/*! @tensorflow/tfjs */ "@tensorflow/tfjs");
const simulation_1 = __webpack_require__(/*! ./model/simulation */ "./src/model/simulation.ts");
const canvas_renderer_1 = __webpack_require__(/*! ./view/canvas-renderer */ "./src/view/canvas-renderer.ts");
const collisions_1 = __webpack_require__(/*! ./model/collisions */ "./src/model/collisions.ts");
function boxMuller() {
    let u1 = Math.random();
    let u2 = Math.random();
    let r = Math.sqrt(-2 * Math.log(u1));
    let t = 2 * Math.PI * u2;
    let z0 = r * Math.cos(t);
    let z1 = r * Math.sin(t);
    return [z0, z1];
}
function randomBody(maxX, maxY) {
    let posX = Math.random() * maxX;
    let posY = Math.random() * maxY;
    let [velX, velY] = boxMuller();
    velX *= 50;
    velY *= 50;
    let radius = Math.random() * 20 + 10;
    return { posX, posY, velX, velY, radius };
}
console.debug(`[Global] TF Backend: ${tf.getBackend()}`);
const hash = window.location.hash.substr(1);
const params = hash
    .split("&")
    .reduce(function (result, item) {
    var parts = item.split("=");
    result[parts[0]] = parts[1];
    return result;
}, {});
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
let bodies = new Array(params.n ? +params.n : 75)
    .fill(null)
    .map(() => randomBody(canvas.width, canvas.height));
let data = simulation_1.bodiesToTensor(bodies);
function animate() {
    return __awaiter(this, void 0, void 0, function* () {
        // step the simulation
        data = simulation_1.updateTensor(data, data => simulation_1.stepGravity(data, { dt: 1 / 60, gravConst: 1e5, dragCoeff: 0.1 }));
        data = simulation_1.updateTensor(data, data => simulation_1.stepBoundary(data, { maxX: canvas.width, maxY: canvas.height }));
        // Retrieve data to draw
        bodies = yield simulation_1.tensorToBodies(data, bodies);
        // apply collisions
        collisions_1.stepCollisions(bodies);
        data.dispose();
        data = simulation_1.bodiesToTensor(bodies);
        // Draw
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        canvas_renderer_1.renderToCanvas(ctx, bodies);
        requestAnimationFrame(animate);
    });
}
animate();
setInterval(() => console.log(tf.memory()), 5000);
// data.dispose()


/***/ }),

/***/ "./src/model/collisions.ts":
/*!*********************************!*\
  !*** ./src/model/collisions.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Select the kth smallest element in xs
 * O(n)
 */
function kSelect(k, xs) {
    let pivot = xs[Math.floor(Math.random() * xs.length)];
    let low = xs.filter(x => x < pivot);
    if (low.length + 1 == k) {
        return pivot;
    }
    if (low.length >= k) {
        return kSelect(k, low);
    }
    else {
        let high = xs.filter(x => x >= pivot);
        return kSelect(k - low.length, high);
    }
}
/**
 * Computes the mean of xs
 * O(n)
 */
function median(xs) {
    let k = Math.floor(xs.length / 2);
    if (xs.length % 2) {
        return kSelect(k, xs);
    }
    else {
        return (kSelect(k - 1, xs) + kSelect(k, xs)) / 2;
    }
}
class KDTree {
    constructor(bodies, splitThreshold, maxDepth) {
        /** @member {boolean} */
        this.isLeaf = maxDepth == 0 || bodies.length <= splitThreshold;
        if (this.isLeaf) {
            this.bodies = bodies;
            return;
        }
        let xs = bodies.map(c => c.posX);
        let ys = bodies.map(c => c.posY);
        let rangeX = Math.max(...xs) - Math.min(...xs);
        let rangeY = Math.max(...ys) - Math.min(...ys);
        /** @member {boolean} */
        this.splitByX = rangeX > rangeY;
        if (this.splitByX) {
            this.splitPoint = median(xs);
            this.low = new KDTree(bodies.filter(c => c.posX < this.splitPoint), splitThreshold, maxDepth - 1);
            this.high = new KDTree(bodies.filter(c => c.posX >= this.splitPoint), splitThreshold, maxDepth - 1);
        }
        else {
            this.splitPoint = median(ys);
            this.low = new KDTree(bodies.filter(c => c.posY < this.splitPoint), splitThreshold, maxDepth - 1);
            this.high = new KDTree(bodies.filter(c => c.posY >= this.splitPoint), splitThreshold, maxDepth - 1);
        }
    }
    query(x, y, radius) {
        if (this.isLeaf) {
            return this.bodies.filter(c => Math.pow(c.posX - x, 2) + Math.pow(c.posY - y, 2) <=
                Math.pow(radius, 2));
        }
        let results = [];
        if (this.splitByX) {
            if (x - radius < this.splitPoint) {
                results.push(...this.low.query(x, y, radius));
            }
            if (x + radius >= this.splitPoint) {
                results.push(...this.high.query(x, y, radius));
            }
        }
        else {
            if (y - radius < this.splitPoint) {
                results.push(...this.low.query(x, y, radius));
            }
            if (y + radius >= this.splitPoint) {
                results.push(...this.high.query(x, y, radius));
            }
        }
        return results;
    }
}
function dist(body1, body2) {
    return Math.sqrt(Math.pow(body1.posX - body2.posX, 2) + Math.pow(body1.posY - body2.posY, 2));
}
function* computeCollisions(kdtree, bodies) {
    for (let body of bodies) {
        const candidates = kdtree.query(body.posX, body.posY, body.radius + 15);
        const colliders = candidates.filter(candidate => dist(body, candidate) < body.radius + candidate.radius &&
            body.posX < candidate.posX);
        for (let collider of colliders) {
            yield [body, collider];
        }
    }
}
function computeElasticCollision(x1, y1, dx1, dy1, x2, y2, dx2, dy2) {
    // recompute velocities
    let dx1f = (dx2 * Math.pow(x1 - x2, 2) +
        (-((dy1 - dy2) * (x1 - x2)) + dx1 * (y1 - y2)) * (y1 - y2)) /
        (Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    let dy1f = (dy1 * Math.pow(x1 - x2, 2) +
        (-((dx1 - dx2) * (x1 - x2)) + dy2 * (y1 - y2)) * (y1 - y2)) /
        (Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    let dx2f = (dx1 * Math.pow(x1 - x2, 2) +
        ((dy1 - dy2) * (x1 - x2) + dx2 * (y1 - y2)) * (y1 - y2)) /
        (Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    let dy2f = (dy2 * Math.pow(x1 - x2, 2) +
        ((dx1 - dx2) * (x1 - x2) + dy1 * (y1 - y2)) * (y1 - y2)) /
        (Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    return [dx1f, dy1f, dx2f, dy2f];
}
function separate(body1, body2) {
    const l = dist(body1, body2);
    const ux = (((body1.posX - body2.posX) / l) * (body1.radius + body2.radius - l)) / 2;
    const uy = (((body1.posY - body2.posY) / l) * (body1.radius + body2.radius - l)) / 2;
    body1.posX += ux;
    body1.posY += uy;
    body2.posX -= ux;
    body2.posY -= uy;
}
function stepCollisions(bodies) {
    const kdtree = new KDTree(bodies, 3, 15);
    let itr = computeCollisions(kdtree, bodies);
    for (let { value, done } = itr.next(); !done; { value, done } = itr.next()) {
        const [circle1, circle2] = value || null;
        [
            circle1.velX,
            circle1.velY,
            circle2.velX,
            circle2.velY
        ] = computeElasticCollision(circle1.posX, circle1.posY, circle1.velX, circle1.velY, circle2.posX, circle2.posY, circle2.velX, circle2.velY);
        separate(circle1, circle2);
    }
}
exports.stepCollisions = stepCollisions;


/***/ }),

/***/ "./src/model/simulation.ts":
/*!*********************************!*\
  !*** ./src/model/simulation.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tf = __webpack_require__(/*! @tensorflow/tfjs */ "@tensorflow/tfjs");
function bodiesToTensor(bodies) {
    return tf.tensor(bodies.map(({ posX, posY, velX, velY, radius }) => [
        posX,
        posY,
        velX,
        velY,
        radius
    ]));
}
exports.bodiesToTensor = bodiesToTensor;
/**
 * Helper function for operating on immutable tensors with proper memory
 * management
 *
 * Example: data = updateTensor(data, (data) => f(data, opts))
 *
 * @param data
 * @param callback
 */
function updateTensor(data, callback) {
    const result = callback(data);
    data.dispose();
    return result;
}
exports.updateTensor = updateTensor;
function tensorToBodies(data, bodies) {
    return __awaiter(this, void 0, void 0, function* () {
        const array = (yield data.array());
        return array.map(([posX, posY, velX, velY, radius], i) => (Object.assign(Object.assign({}, (bodies ? bodies[i] : {})), { posX,
            posY,
            velX,
            velY,
            radius })));
    });
}
exports.tensorToBodies = tensorToBodies;
function stepGravity(data, { dt, gravConst = 1, dragCoeff = 0 }) {
    return tf.tidy(() => {
        const pos = data.slice([0, 0], [-1, 2]);
        const vel = data.slice([0, 2], [-1, 2]);
        const radius = data.slice([0, 4], [-1, 1]);
        const r = tf.sub(pos.expandDims(), pos.expandDims(1));
        const rNorm = tf.norm(r, 2, 2);
        const diagMask = tf.sub(1, tf.eye(pos.shape[0])).expandDims(2);
        const force = tf.mul(-gravConst, tf.mul(diagMask, tf.div(r, tf.pow(rNorm, 3).expandDims(2))));
        const acc = tf.sub(tf.sum(force, 0), tf.mul(dragCoeff, vel));
        const newVel = tf.add(vel, tf.mul(dt, acc));
        const newPos = tf.add(pos, tf.mul(dt, newVel));
        const newData = tf.concat([newPos, newVel, radius], 1);
        return newData;
    });
}
exports.stepGravity = stepGravity;
function stepBoundary(data, { minX = 0, minY = 0, maxX, maxY }) {
    return tf.tidy(() => {
        const pos = data.slice([0, 0], [-1, 2]);
        const vel = data.slice([0, 2], [-1, 2]);
        const radius = data.slice([0, 4], [-1, 1]);
        const oob = tf.logicalOr(tf.less(tf.sub(pos, radius), [minX, minY]), tf.greater(tf.add(pos, radius), [maxX, maxY]));
        const newPos = tf.minimum(tf.maximum(pos, tf.add([[minX, minY]], radius)), tf.sub([[maxX, maxY]], radius));
        const newVel = tf.mul(vel, tf.sub(1, tf.mul(oob, 2)));
        const newData = tf.concat([newPos, newVel, radius], 1);
        return newData;
    });
}
exports.stepBoundary = stepBoundary;


/***/ }),

/***/ "./src/view/canvas-renderer.ts":
/*!*************************************!*\
  !*** ./src/view/canvas-renderer.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function renderToCanvas(ctx, bodies) {
    bodies.forEach(({ posX, posY, radius }) => {
        ctx.beginPath();
        ctx.arc(posX, posY, radius, 0, 2 * Math.PI);
        ctx.fill();
    });
}
exports.renderToCanvas = renderToCanvas;


/***/ }),

/***/ "@tensorflow/tfjs":
/*!*********************!*\
  !*** external "tf" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = tf;

/***/ })

/******/ });
//# sourceMappingURL=main.js.map