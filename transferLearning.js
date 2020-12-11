const video = document.querySelector('#webcam');
const enableWebcamButton = document.querySelector('#enableWebcamButton');
const disableWebcamButton = document.querySelector('#disableWebcamButton');
const a_Button = document.querySelector('#class-a');
const b_Button = document.querySelector('#class-b');
const c_Button = document.querySelector('#class-c');
const reset_Button = document.querySelector('#reset');
const A = document.querySelector('#A');
const B = document.querySelector('#B');
const C = document.querySelector('#C');
const clf = knnClassifier.create();

let model = undefined ;

const classes = ['A', 'B', 'C'];
let clicks = {0:0, 1:0, 2:0};

mobilenet.load().then((loadedModel)=>{
    model = loadedModel;
    document.querySelector("#status").innerHTML = "model is loaded.";
    document.getElementById('class-a').addEventListener('click', (e) => addExample(e, 0));
    document.getElementById('class-b').addEventListener('click', (e) => addExample(e, 1));
    document.getElementById('class-c').addEventListener('click', (e) => addExample(e, 2));
    enableWebcamButton.disabled = false;
    reset_Button.disabled = false;
    reset_Button.addEventListener('click', reset);
});

if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
    disableWebcamButton.addEventListener('click', disableCam);
}
else {
    console.warn('getUserMedia() is not supported by your browser');
}


function getUserMediaSupported() {
    /* Check if both methods exists.*/
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function enableCam(event) {
    /* disable this button once clicked.*/
    event.target.disabled = true;
    
    /* show the disable webcam button once clicked.*/
    disableWebcamButton.disabled = false;
    a_Button.disabled = false;
    b_Button.disabled = false;
    c_Button.disabled = false;

    /* show the video and canvas elements */
    document.querySelector("#liveView").style.display = "block";

    // getUsermedia parameters to force video but not audio.
    const constraints = {
    video: true
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        video.srcObject = stream;
        video.addEventListener('loadeddata', predictCam);
    }).catch(function(err){
        console.error('Error accessing media devices.', error);
    });
};

function disableCam(event) {
    event.target.disabled = true;
    a_Button.disabled = true;
    b_Button.disabled = true;
    c_Button.disabled = true;
    enableWebcamButton.disabled = false;

    /* stop streaming */
    video.srcObject.getTracks().forEach(track => {
      track.stop();
    })
  
    /* clean up. some of these statements should be placed in processVid() */
    video.srcObject = null;
    video.removeEventListener('loadeddata', predictCam);
    document.querySelector("#result").innerHTML = 'Start to classification!';
}

function predictCam() {
    
    if (video.srcObject == null) {
        return;
    }
    if (clf.getNumClasses() > 0) {
        // Get the activation from mobilenet from the webcam.
        const activation = model.infer(video, true);
        // Get the most likely class and confidence from the classifier module.
        clf.predictClass(activation).then((result)=>{document.querySelector("#result").innerHTML =
                `prediction: ${classes[result.label]}, probability: ${result.confidences[result.label]}`;
            });
    }
    else{
        document.querySelector("#result").innerHTML = 'Start to classification!';
    }
    setTimeout(predictCam,500);
}

function addExample(event, classId) {
  
    clicks[classId] += 1;
    
    var canvas = document.createElement('canvas');
    canvas.width  = 320;
    canvas.height = 240;
    const context = canvas.getContext('2d');
    context.drawImage( video, 5, 2, 320, 190 );

    switch (classId) {
        case 0:
            event.target.innerHTML = `Add A(${clicks[classId]})`;
            A.appendChild(canvas)
            break;
        case 1:
            event.target.innerHTML = `Add B(${clicks[classId]})`;
            B.appendChild(canvas)
            break;
        case 2:
            event.target.innerHTML = `Add C(${clicks[classId]})`;
            C.appendChild(canvas)
            break;
        default:
    }
  
    const embedding = model.infer(video, true)
    clf.addExample(embedding, classId);
}

function reset() {
    while(A.firstChild){
        A.removeChild(A.firstChild);
    }
    while(B.firstChild){
        B.removeChild(B.firstChild);
    }
    while(C.firstChild){
        C.removeChild(C.firstChild);
    }
    clicks[0] = 0 ;clicks[1] = 0 ;clicks[2] = 0 ;
    a_Button.innerHTML = 'Add A';b_Button.innerHTML = 'Add B';c_Button.innerHTML = 'Add C';
    clf.clearAllClasses();
}
