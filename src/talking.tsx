
import 'talkify-tts/dist/talkify.min.js';
import Queue from 'js-queue';

var queue = new Queue();


var loadingElement: HTMLDivElement = null;
function readWord(word, cb?: () => void) {
    if(loadingElement == null) {
        loadingElement = document.createElement("div");
        loadingElement.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
        loadingElement.style.color = "black";
        loadingElement.style.fontWeight = "bold";
        loadingElement.style.flexDirection = "column";
        loadingElement.style.justifyContent = "center";
        loadingElement.style.alignItems = "center";
        loadingElement.style.display = "none";
        loadingElement.style.position = "absolute";
        loadingElement.style.top = "0";
        loadingElement.style.left = "0";
        loadingElement.style.width = "100%";
        loadingElement.style.height = "100%";
        loadingElement.style.zIndex = "10000";
        loadingElement.textContent = "Loading speech file...";
        document.body.appendChild(loadingElement);
    }
    queue.add(function() {
        const handleEnd = () => {
            loadingElement.style.display = "none";
            if(typeof cb == 'function')
                cb();
            this.next();
        }
        console.log("starting speech", word);
        if(word.trim().length == 0) {
            handleEnd();
        } else {
            var url = new URL("https://epallinone.com/quizzes/speech/");
            url.searchParams.append("text", word);
            loadingElement.style.display = "flex";
            fetch(url as any, {
                credentials: 'same-origin', // include, *same-origin, omit
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            }).then(response => response.blob()).then(blob => {
                var audio = new Audio(URL.createObjectURL(blob));
                audio.addEventListener('canplaythrough', function() { 
                    loadingElement.style.display = "none";
                    audio.addEventListener("ended", () => {
                        handleEnd();
                    });
                    audio.play();
                });
                audio.addEventListener("error", () => {
                    handleEnd();
                });
            }).catch(() => {
                handleEnd();
            });
        }
        
    });
}

export { readWord };