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
//准确度，用于设置地形每一块站几个像素，最精确为1
var ACCURACY = 4;



function initScene() {
    scene = new THREE.Scene(); //场景
    scene.background = new THREE.Color(0x333333); //设置场景背景
}

function initCamera() {
    var aspect = windowW / windowH; //camera视域长宽比 
    camera = new THREE.PerspectiveCamera(60, aspect, 1, 2000); //相机
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
    controls = new THREE.OrbitControls(camera); //加入控制器
    controls.enablePan = true;
}

function initLight() {

    scene.add(new THREE.AmbientLight(0xffffff)); //加入环境光

    // var lights = [];
    // lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    // lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    // lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    // lights[0].position.set(0, 0, 100);
    // lights[1].position.set(200, -200, 100);
    // lights[2].position.set(-200, 200, 100);

    // //光源位置标记器
    // var pointLightHelper1 = new THREE.PointLightHelper(lights[0], 1);
    // var pointLightHelper2 = new THREE.PointLightHelper(lights[1], 1);
    // var pointLightHelper3 = new THREE.PointLightHelper(lights[2], 1);
    // scene.add(pointLightHelper1);
    // scene.add(pointLightHelper2);
    // scene.add(pointLightHelper3);

    // scene.add(lights[0]);
    // scene.add(lights[1]);
    // scene.add(lights[2]);
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

//初始化地形面板
function initPlane() {
    var Xsize = ~~(elevWidth / ACCURACY), //x方向像素点
        Ysize = ~~(elevHeight / ACCURACY); //y方向像素点
    console.log("initPlane()->Xsize:" + Xsize + "Ysize:" + Ysize);
    planeGeometry = new THREE.PlaneGeometry(elevWidth, elevHeight, Xsize - 1, Ysize - 1);
    planeGeometry.verticesNeedUpdate = true;
    var material = new THREE.MeshLambertMaterial({
        map: new THREE.ImageUtils.loadTexture('textures/puget_text.png'),
        side: THREE.DoubleSide
    });
    for (let i = 0; i < planeGeometry.vertices.length; i++) {
        var x = i % Xsize,
            y = ~~(i / Xsize);
        var indexOfAltitudes = y * ACCURACY * elevWidth + x * ACCURACY;
        planeGeometry.vertices[i].z = altitudes[indexOfAltitudes];
    }
    var planeMesh = new THREE.Mesh(planeGeometry, material);
    scene.add(planeMesh);
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
        initPlane();
    }
    img.src = 'textures/puget_elev.png';
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
    // scene.add(new THREE.AxesHelper(1000));
}


function setMy3D() {

}

function draw() {
    requestAnimationFrame(draw); //告诉浏览器下一次重绘之前调用draw函数来更新动画
    controls.update(clock.getDelta()); //更新控制器
    stats.update(); //性能检测刷新

    renderer.render(scene, camera); //进行渲染
};

function main() {
    initMy3D();
    setMy3D();
    draw();
}