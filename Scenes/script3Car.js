var numberKeys = ['0', '1', '2', '3'];

function cameraSwitch(node)
{
    for (var i=0; i<numberKeys.length; i++)
    {
        if (pressedKeys[numberKeys[i].charCodeAt(0)])
        {
            var camName = "camera" + numberKeys[i];
            var cam = currentScene.getObjectByName(camName);
            if (cam !== undefined)
            {
                currentCamera = cam;
            }
        }
    }
}

function cameraTrack(node)
{
    var target = currentScene.getObjectByName(node.userData["target"]);
    node.lookAt(target.position);
}

function cameraMove(node)
{
    var target = currentScene.getObjectByName(node.userData["target"]).position;

    node.lookAt(target);

    node.position.set(target.x + 30, target.y+20, target.z);

}

function moveCar(node)
{
    //var carParts = [].slice.call(node.childNodes);
    var carParts2 = node.children;
    var newPos = node.position;
    var newAngle = node.rotation;
    //right
    if (pressedKeys[68])
    {
        newAngle.set(newAngle.x, newAngle.y - 0.05, newAngle.z);
    }
    //left
    if (pressedKeys[65])
    {
        newAngle.set(newAngle.x, newAngle.y + 0.05, newAngle.z);
    }
    //forward
    if (pressedKeys[87])
    {
        var v = new THREE.Vector3( 0.3*Math.cos(newAngle.y), 0, 0.3*Math.sin(-newAngle.y));
        newPos.add(v);
        //distance/radius
        for(var i = 0; i < carParts2.length; i++){
            if(carParts2[i].name == "carWheel" && carParts2[i] !== undefined){
                var radius = carParts2[i].userData["radius"];
                carParts2[i].rotateZ(-v.length()/radius);
            }
        }
    }
    if(pressedKeys[83]){
        var v = new THREE.Vector3(-0.3*Math.cos(newAngle.y), 0, -0.3*Math.sin(-newAngle.y));
        newPos.add(v);
        //distance/radius
        for(var i = 0; i < carParts2.length; i++){
            if(carParts2[i].name == "carWheel" && carParts2[i] !== undefined){
                var radius = carParts2[i].userData["radius"];
                carParts2[i].rotateZ(v.length()/radius);
            }
        }
    }
}