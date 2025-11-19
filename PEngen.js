//PEngen.js
// Имитация PEngenAPI на основе HTML5 Canvas и JavaScript
class Clock {
    constructor() {
        this.lastTime = performance.now();
    }
    restart() {
        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;
        return {
            asSeconds: () => deltaTime
        };
    }
    static async WaitSeconds(seconds) {
        const clock = new Clock();
        let elapsed = 0;
        const animate = (currentTime) => {
            const deltaTime = clock.restart().asSeconds();
            elapsed += deltaTime;
            Program.gEngine.Draw();
            if (elapsed < seconds) {
                requestAnimationFrame(animate);
            }
        };
        return new Promise(resolve => {
            animate();
            setTimeout(resolve, seconds * 1000);
        });
    }
}

// Вспомогательный класс для имитации SFML.System.Mouse
const Mouse = {
    position: { x: 0, y: 0 },
    isButtonPressed: false,
    onMouseMove: function(event) {
        Mouse.position.x = event.clientX;
        Mouse.position.y = event.clientY;
    },
    onMouseDown: function() {
        Mouse.isButtonPressed = true;
    },
    onMouseUp: function() {
        Mouse.isButtonPressed = false;
    },
    GetPosition: (window) => {
        const rect = window.canvas.getBoundingClientRect();
        return {
            x: Math.round(Mouse.position.x - rect.left),
            y: Math.round(Mouse.position.y - rect.top)
        };
    },
    IsButtonPressed: (button) => {
        return Mouse.isButtonPressed;
    }
};
window.addEventListener('mousemove', Mouse.onMouseMove);
window.addEventListener('mousedown', Mouse.onMouseDown);
window.addEventListener('mouseup', Mouse.onMouseUp);

// Вспомогательный класс для имитации SFML.System.Keyboard
const Keyboard = {
    keys: {},
    isKeyPressed: function(key) {
        return this.keys[key.toUpperCase()];
    },
    onKeyDown: function(event) {
        Keyboard.keys[event.key.toUpperCase()] = true;
    },
    onKeyUp: function(event) {
        Keyboard.keys[event.key.toUpperCase()] = false;
    }
};
window.addEventListener('keydown', Keyboard.onKeyDown);
window.addEventListener('keyup', Keyboard.onKeyUp);

// Имитация SFML.Graphics.RenderWindow
class RenderWindow {
    constructor(width, height, title) {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;
        document.body.appendChild(this.canvas);
        document.title = title;
        this.objects = [];
        this.Closed = [];
        this.TextEntered = [];
    }
    Close() { this.canvas.remove(); }
    DispatchEvents() {}
    Clear(color) {
        const hexColor = '#' + color.toString(16).padStart(6, '0');
        this.ctx.fillStyle = hexColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    draw(drawable) { if (drawable.draw) { drawable.draw(this.ctx); } }
    display() {}
}

// Имитация SFML.Graphics.Color
class Color {
    constructor(r, g, b, a = 255) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    toString() {
        const r = this.r.toString(16).padStart(2, '0');
        const g = this.g.toString(16).padStart(2, '0');
        const b = this.b.toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }
}
Color.Black = 0x000000;
Color.White = 0xFFFFFF;

// Имитация SFML.Graphics.Font
class Font {
    constructor(fontString) {
        this.path = fontString;
    }
}

// Имитация SFML.System.Vector2i
class Vector2i {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

// Имитация SFML.Graphics.FloatRect
class FloatRect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    intersects(other) {
        return this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y;
    }
    GetGlobalBounds() { return this; }
    Contains(x, y) {
        return x >= this.x && x <= this.x + this.width &&
            y >= this.y && y <= this.y + this.height;
    }
}


// Имитация PEngenAPI.GnuEngen.GnuEngenSFML
class GnuEngenSFML {

    constructor() {
        this.window = null;
        this.objects = [];
        this.clock = new Clock();
    }


    static ObjectType = {
        Cube: 0,
        Line: 1,
        Sprite: 2,
        Text: 3,
        Mesh: 4,
        Button: 5,
        TextButton: 6,
        Input: 7
    };
    static D2Gun = class {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.sx = 0;
            this.sy = 0;
            this.type = GnuEngenSFML.ObjectType.Sprite;
            this.base_color = 0x000000;
            this.text_color = 0xFFFFFF;
            this.texture = null;
            this.animation = null;
            this.text = "";
            this.font = null;
            this.onClick = null;
            this.inputString = "";
            this.isActive = false;
        }
    };
    static Animation = class {
        constructor() {
            this.Frames = [];
            this.FrameSpeed = 0.1;
            this.CurrentFrame = 0;
            this.timer = 0;
        }
        Update(deltaTime) {
            if (this.Frames.length === 0) return;
            this.timer += deltaTime;
            if (this.timer >= this.FrameSpeed) {
                this.timer = 0;
                this.CurrentFrame++;
                if (this.CurrentFrame >= this.Frames.length) {
                    this.CurrentFrame = 0;
                }
            }
        }
        GetCurrentFrame() {
            if (this.Frames.length === 0) return null;
            return this.Frames[this.CurrentFrame];
        }
    };
    static FloatRect = class {
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        intersects(other) {
            return this.x < other.x + other.width &&
                this.x + this.width > other.x &&
                this.y < other.y + other.height &&
                this.y + this.height > other.y;
        }
        GetGlobalBounds() { return this; }
        Contains(x, y) {
            return x >= this.x && x <= this.x + this.width &&
                y >= this.y && y <= this.y + this.height;
        }
    };
    InitWindow(width = 800, height = 600, title = "PEngen SFML") {
        if (this.window === null) {
            this.window = new RenderWindow(width, height, title);
            this.window.canvas.addEventListener('click', (event) => this.handleMouseClick(event));

            // Вызов интро-экрана
            this.ShowIntro(width, height);
        }
    }

    ShowIntro(width = 800, height = 600) {
        const intro = new GnuEngenSFML.D2Gun();

        intro.x = (width - (width / 2)) / 2;
        intro.y = (height - (height / 2)) / 2;
        intro.sx = width / 2;
        intro.sy = height / 2;

        intro.texture = new Image();
        intro.texture.src = "ico-engen.png";

        intro.type = GnuEngenSFML.ObjectType.Sprite;

        Program.gEngine.AddObject(intro);

        Clock.WaitSeconds(2).then(() => {
            Program.gEngine.DeleteObject(intro);
        });
    }

    handleMouseClick(event) {
        const mouseX = event.clientX - this.window.canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - this.window.canvas.getBoundingClientRect().top;

        for (const obj of this.objects) {
            if (obj.type === GnuEngenSFML.ObjectType.Button || obj.type === GnuEngenSFML.ObjectType.TextButton) {
                if (mouseX >= obj.x && mouseX <= obj.x + obj.sx && mouseY >= obj.y && mouseY <= obj.y + obj.sy) {
                    if (obj.onClick) {
                        obj.onClick();
                    }
                }
            }
        }
    }

    AddObject(obj) { this.objects.push(obj); }
    DeleteObject(obj) {
        const index = this.objects.indexOf(obj);
        if (index !== -1) { this.objects.splice(index, 1); }
    }
    UpdateObject(oldObj, newObj) {
        const index = this.objects.indexOf(oldObj);
        if (index !== -1) { this.objects[index] = newObj; }
    }

    Draw() {
        const deltaTime = this.clock.restart().asSeconds();
        this.window.DispatchEvents();
        this.window.Clear(Color.Black);
        const mousePos = Mouse.GetPosition(this.window);
        const ctx = this.window.ctx;

        for (const obj of this.objects) {
            const color = '#' + obj.base_color.toString(16).padStart(6, '0');
            switch (obj.type) {
                case GnuEngenSFML.ObjectType.Cube:
                    ctx.fillStyle = color;
                    ctx.fillRect(obj.x, obj.y, obj.sx, obj.sy);
                    break;
                case GnuEngenSFML.ObjectType.Line:
                    ctx.strokeStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(obj.x, obj.y);
                    ctx.lineTo(obj.x + obj.sx, obj.y + obj.sy);
                    ctx.stroke();
                    break;
                case GnuEngenSFML.ObjectType.Sprite:
                    this.DrawSprite(obj, deltaTime);
                    break;
                case GnuEngenSFML.ObjectType.Text:
                    this.DrawText(obj, color);
                    break;
                case GnuEngenSFML.ObjectType.Button:
                    this.DrawButton(obj, mousePos, deltaTime);
                    break;
                case GnuEngenSFML.ObjectType.TextButton:
                    this.DrawTextButton(obj, mousePos);
                    break;
                case GnuEngenSFML.ObjectType.Input:
                    this.DrawInput(obj, mousePos);
                    break;
                case GnuEngenSFML.ObjectType.Mesh:
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.moveTo(obj.x, obj.y);
                    ctx.lineTo(obj.x + obj.sx, obj.y);
                    ctx.lineTo(obj.x + obj.sx, obj.y + obj.sy);
                    ctx.lineTo(obj.x, obj.y + obj.sy);
                    ctx.closePath();
                    ctx.fill();
                    break;
            }
        }
        this.window.display();
    }

    DrawSprite(obj, deltaTime) {
        const tex = obj.animation !== null ? obj.animation.GetCurrentFrame() : obj.texture;
        if (tex !== null && tex.complete) {
            if (obj.animation !== null) obj.animation.Update(deltaTime);
            this.window.ctx.drawImage(tex, obj.x, obj.y, obj.sx, obj.sy);
        }
    }
    DrawText(obj, color) {
        if (obj.font && obj.text) {
            this.window.ctx.fillStyle = color;
            this.window.ctx.font = obj.font.path;
            this.window.ctx.fillText(obj.text, obj.x, obj.y);
        }
    }
    DrawButton(obj, mousePos, deltaTime) {
        const tex = obj.animation !== null ? obj.animation.GetCurrentFrame() : obj.texture;
        if (tex !== null && tex.complete) {
            if (obj.animation !== null) obj.animation.Update(deltaTime);
            const isHover = mousePos.x >= obj.x && mousePos.x <= obj.x + obj.sx && mousePos.y >= obj.y && mousePos.y <= obj.y + obj.sy;
            if (isHover) {
                this.window.ctx.globalAlpha = 0.8;
                if (Mouse.IsButtonPressed() && obj.onClick !== null) obj.onClick();
            }
            this.window.ctx.drawImage(tex, obj.x, obj.y, obj.sx, obj.sy);
            this.window.ctx.globalAlpha = 1.0;
        }
    }
    DrawTextButton(obj, mousePos) {
        const ctx = this.window.ctx;
        const isHover = mousePos.x >= obj.x && mousePos.x <= obj.x + obj.sx && mousePos.y >= obj.y && mousePos.y <= obj.y + obj.sy;
        ctx.fillStyle = isHover ? obj.isActive_color ? '#' + obj.isActive_color.toString(16).padStart(6, '0') : '#4f7188ff' : obj.base_color ? '#' + obj.base_color.toString(16).padStart(6, '0') : '#333333';
        ctx.fillRect(obj.x, obj.y, obj.sx, obj.sy);
        if (isHover && Mouse.IsButtonPressed() && obj.onClick !== null) obj.onClick();

        if (obj.font && obj.text) {
            ctx.fillStyle = obj.text_color ? '#' + obj.text_color.toString(16).padStart(6, '0') : '#FFFFFF';
            ctx.font = obj.font.path;
            ctx.fillText(obj.text, obj.x + 10, obj.y + 10 + 20);
        }
    }
    DrawInput(obj, mousePos) {
        const ctx = this.window.ctx;
        const isHover = mousePos.x >= obj.x && mousePos.x <= obj.x + obj.sx && mousePos.y >= obj.y && mousePos.y <= obj.y + obj.sy;

        if (isHover && Mouse.IsButtonPressed()) {
            obj.isActive = true;
        } else if (Mouse.IsButtonPressed() && !isHover) {
            obj.isActive = false;
        }

        ctx.fillStyle = obj.isActive ? '#FFFFC8' : '#323232';
        ctx.fillRect(obj.x, obj.y, obj.sx, obj.sy);

        if (obj.font) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = obj.font.path;
            ctx.fillText(obj.inputString, obj.x + 5, obj.y + 5 + 20);
        }
    }
}

// Имитация PEngenAPI.GameEngine
class GameEngine {
    constructor() {
        this.graphicsEngine = null;
        this.gameObjects = [];
        this.clock = new Clock();
    }
    static GameObject = class {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.vx = 0;
            this.vy = 0;
            this.width = 0;
            this.height = 0;
            this.isStatic = false;
            this.mass = 1.0;
            this.OnUpdate = null;
            this.visual = null;
        }
    };
    AddObject(obj) {
        this.gameObjects.push(obj);
        if (obj.visual !== null) {
            this.graphicsEngine.AddObject(obj.visual);
        }
    }
    DeleteObject(obj) {
        const index = this.gameObjects.indexOf(obj);
        if (index !== -1) {
            this.gameObjects.splice(index, 1);
            if (obj.visual !== null) {
                this.graphicsEngine.DeleteObject(obj.visual);
            }
        }
    }
    UpdateObject(oldObj, newObj) {
        const index = this.gameObjects.indexOf(oldObj);
        if (index !== -1) {
            this.gameObjects[index] = newObj;
            if (oldObj.visual !== null) {
                this.graphicsEngine.UpdateObject(oldObj.visual, newObj.visual);
            }
        }
    }
    Run() {
        const loop = () => {
            const deltaTime = this.clock.restart().asSeconds();
            this.UpdatePhysics(deltaTime);
            this.HandleCollisions();
            this.UpdateLogic(deltaTime);
            this.graphicsEngine.Draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
    UpdatePhysics(dt) {
        for (const obj of this.gameObjects) {
            if (!obj.isStatic) {
                obj.x += obj.vx * dt;
                obj.y += obj.vy * dt;
                if (obj.visual !== null) {
                    obj.visual.x = Math.round(obj.x);
                    obj.visual.y = Math.round(obj.y);
                }
            }
        }
    }
    UpdateLogic(dt) {
        for (const obj of this.gameObjects) {
            if (obj.OnUpdate) {
                obj.OnUpdate(obj);
            }
        }
    }
    HandleCollisions() {
        for (let i = 0; i < this.gameObjects.length; i++) {
            const a = this.gameObjects[i];
            if (a.isStatic) continue;
            for (let j = i + 1; j < this.gameObjects.length; j++) {
                const b = this.gameObjects[j];
                if (b.isStatic) continue;
                if (this.CheckAABBCollision(a, b)) {
                    this.ResolveCollision(a, b);
                }
            }
        }
    }
    CheckAABBCollision(a, b) {
        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    }
    ResolveCollision(a, b) {
        const vxA = a.vx;
        const vyA = a.vy;
        const vxB = b.vx;
        const vyB = b.vy;
        a.vx = (vxA * (a.mass - b.mass) + 2 * b.mass * vxB) / (a.mass + b.mass);
        b.vx = (vxB * (b.mass - a.mass) + 2 * a.mass * vxA) / (a.mass + b.mass);
        a.vy = (vyA * (a.mass - b.mass) + 2 * b.mass * vyB) / (a.mass + b.mass);
        b.vy = (vyB * (b.mass - a.mass) + 2 * a.mass * vyA) / (a.mass + b.mass);

        const overlapX = Math.min(a.x + a.width - b.x, b.x + b.width - a.x);
        const overlapY = Math.min(a.y + a.height - b.y, b.y + b.height - a.y);

        if (overlapX < overlapY) {
            if (a.x < b.x) {
                a.x -= overlapX / 2;
                b.x += overlapX / 2;
            } else {
                a.x += overlapX / 2;
                b.x -= overlapX / 2;
            }
        } else {
            if (a.y < b.y) {
                a.y -= overlapY / 2;
                b.y += overlapY / 2;
            } else {
                a.y += overlapY / 2;
                b.y -= overlapY / 2;
            }
        }
        if (a.visual !== null) {
            a.visual.x = Math.round(a.x);
            a.visual.y = Math.round(a.y);
        }
        if (b.visual !== null) {
            b.visual.x = Math.round(b.x);
            b.visual.y = Math.round(b.y);
        }
    }
}

// Имитация PEngenAPI.SuperUpdate.SuperUpdate
class SuperUpdate {
    constructor(gEngine, engine) {
        this.gEngine = gEngine;
        this.engine = engine;
        this.gameObjects = [];
    }
    static GnuType = { Gnu: "Gnu", Engen: "Engen" };
    static GameOBJN = class {
        constructor() {
            this.name = "";
            this.d2Gun = null;
            this.gameObject = null;
            this.gnuType = null;
        }
    };
    AddObject(obj) {
        this.gameObjects.push(obj);
        if (obj.gnuType === SuperUpdate.GnuType.Gnu) {
            this.gEngine.AddObject(obj.d2Gun);
        } else if (obj.gnuType === SuperUpdate.GnuType.Engen) {
            this.engine.AddObject(obj.gameObject);
        }
    }
    DeleteObject(name) {
        for (let i = this.gameObjects.length - 1; i >= 0; i--) {
            if (this.gameObjects[i].name === name) {
                const obj = this.gameObjects[i];
                if (obj.gnuType === SuperUpdate.GnuType.Gnu) {
                    this.gEngine.DeleteObject(obj.d2Gun);
                } else if (obj.gnuType === SuperUpdate.GnuType.Engen) {
                    this.engine.DeleteObject(obj.gameObject);
                }
                this.gameObjects.splice(i, 1);
            }
        }
    }
    FindObject(name) {
        for (const obj of this.gameObjects) {
            if (obj.name === name) return obj;
        }
        return null;
    }
    Clear() {
        for (const obj of this.gameObjects) {
            if (obj.gnuType === SuperUpdate.GnuType.Gnu) {
                this.gEngine.DeleteObject(obj.d2Gun);
            } else if (obj.gnuType === SuperUpdate.GnuType.Engen) {
                this.engine.DeleteObject(obj.gameObject);
            }
        }
        this.gameObjects = [];
    }
    Exists(name) {
        for (const obj of this.gameObjects) {
            if (obj.name === name) return true;
        }
        return false;
    }
    UpdateObject(obj) {
        for (let i = this.gameObjects.length - 1; i >= 0; i--) {
            if (this.gameObjects[i].name === obj.name) {
                this.gameObjects[i] = obj;
            }
        }
    }
    Update() {
        for (const item of this.gameObjects) {
            if (item.gnuType === SuperUpdate.GnuType.Gnu) {
                this.gEngine.UpdateObject(item.d2Gun, item.d2Gun);
            } else if (item.gnuType === SuperUpdate.GnuType.Engen) {
                this.engine.UpdateObject(item.gameObject, item.gameObject);
            }
        }
    }
}