var container;
var stats, scene, camera, renderer, controls;
var mesh;
var windowW = 1000,
    windowH = 700; //显示视窗的长宽//影响到camera视点的设置
var clock = new THREE.Clock();
var img;
var ELEVimg;
var elevData, elevWidth, elevHeight;

//基础海拔  最高海拔
var BASE_ALTITUDE = 0,
    HIGHEST_HEIGHT = 100;
var altitudes = [];

function initScene() {
    scene = new THREE.Scene(); //场景
    scene.background = new THREE.Color(0x333333); //设置场景背景
}

function initCamera() {
    var aspect = windowW / windowH; //camera视域长宽比 
    camera = new THREE.PerspectiveCamera(45, aspect, 1, 2000); //相机
    //参数PerspectiveCamera( fov, aspect, near, far )
    // fov(Number): 仰角的角度
    // aspect(Number): 截平面长宽比，多为画布的长宽比。
    // near(Number): 近面的距离
    // far(Number): 远面的距离
    camera.position.set(-20, -20, 200);
    camera.up = new THREE.Vector3(0, 0, 1);
    camera.lookAt({
        x: 100,
        y: 100,
        z: 0
    });
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: true
    }); //渲染器  //参数抗锯齿 打开
    renderer.setSize(windowW, windowH);
    container.appendChild(renderer.domElement); //在html中加入渲染器
}

function initControler() {
    // controls = new THREE.FlyControls(camera); //加入控制器
    // controls.movementSpeed = 100; //设置移动的速度
    // controls.rollSpeed = Math.PI / 6; //设置旋转速度

    // controls = new THREE.FirstPersonControls(camera, container);
    // controls.lookSpeed = 0.15; //鼠标移动查看的速度
    // controls.movementSpeed = 20; //相机移动速度 
    // //不知道为什么初始化进入看向的不是lookat的位置，可以用lon和lat修改角度，看相目标位置
    // controls.lon = 45; //进入初始视角x轴的角度
    // controls.lat = -180; //初始视角进入后y轴的角度

    controls = new THREE.OrbitControls(camera); //加入控制器
    controls.enablePan = true;
}

function initLight() {
    // var pointLight = new THREE.PointLight(0xffffff);
    // pointLight.position.set(0, 1000, 500);
    // scene.add(pointLight); //加入点光源

    scene.add(new THREE.AmbientLight(0xffffff)); //加入环境光
}

//返回RBG对应的海拔  海拔=最低海拔+最大高差X平均像素值/255
function turnToAltitude(r, b, g, full) {
    return (BASE_ALTITUDE + HIGHEST_HEIGHT * (r + b + g) / 3 / full);
}

//将所有elevData转化为海拔高度
function getAllAltitude() {
    for (let i = 0; i < elevData.length; i += 4) {
        altitudes.push(turnToAltitude(elevData[i], elevData[i + 1], elevData[i + 2], elevData[i + 3])); //R,B,G,255
    }
}

function loadIMG() {
    ELEVimg = document.getElementById("ELEVloader");
    var context = ELEVimg.getContext('2d');
    img = new Image;
    img.onload = function () {
        ELEVimg.width = img.width;
        ELEVimg.height = img.height;
        context.drawImage(img, 0, 0);
        elevData = context.getImageData(0, 0, img.width, img.height).data; //读取整张图片的像素。
        elevWidth = img.width;
        elevHeight = img.height;
        getAllAltitude();

        testCode();
    }
    img.src = 'textures/canyon_elev.png';
}

function initMy3D() {
    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
        retrun;
    }
    //获取container元素
    container = document.getElementById('container');

    initScene();

    initCamera();

    initRenderer();

    initControler();

    initLight();

    loadIMG();

    stats = new Stats(); //性能检测器
    container.appendChild(stats.dom);

    //显示坐标轴
    scene.add(new THREE.AxesHelper(1000));

}

var K = 8;

function testCode() {
    //绘制XY为左上角的正方形块
    function addTrangle(X, Y) {
        var geometry = new THREE.Geometry();
        var p1 = new THREE.Vector3(X, Y, altitudes[Y * 1024 + X]);
        var p2 = new THREE.Vector3(X + K, Y, altitudes[Y * 1024 + X + K]);
        var p3 = new THREE.Vector3(X + K, Y + K, altitudes[(Y + K) * 1024 + X + K]);
        var p4 = new THREE.Vector3(X, Y + K, altitudes[(Y + K) * 1024 + X]);

        geometry.vertices.push(p1);
        geometry.vertices.push(p4);
        geometry.vertices.push(p3);
        geometry.vertices.push(p1);
        geometry.vertices.push(p1);
        geometry.colors.push(color);
        geometry.colors.push(color);
        geometry.colors.push(color);
        geometry.colors.push(color);
        geometry.colors.push(color);
        scene.add(new THREE.Line(geometry, material, THREE.LineSegments));
    }

    var material = new THREE.LineBasicMaterial({
        vertexColors: true
    });
    var color = new THREE.Color(0xffffff);
    for (let i = 0; i < elevHeight - K; i += K) {
        for (let j = 0; j < elevWidth - K; j += K) {
            addTrangle(j, i);
        }
    }

}

function setMy3D() {
    // var cubeGeometry = new THREE.CubeGeometry(10, 10, 10);

    // var cubeMaterial = new THREE.MeshLambertMaterial({
    //     color: 0x00ffff
    // });

    // cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // cube.position.x = 50;
    // cube.position.y = 50;
    // scene.add(cube);
}

function draw() {
    requestAnimationFrame(draw); //告诉浏览器下一次重绘之前调用draw函数来更新动画
    controls.update(clock.getDelta()); //更新控制器
    stats.update(); //性能检测刷新

    renderer.render(scene, camera); //进行渲染
};

var id_Interal;

function main() {
    initMy3D();
    setMy3D();
    // // //等待xxx加载完再执行draw()
    // id_Interal = setInterval(function () {
    //     if (mixer != undefined) {
    //         draw();
    //         window.clearInterval(id_Interal);
    //     }
    // }, 10);

    draw();
}