
import 'talkify-tts/dist/talkify.min.js';
import Queue from 'js-queue';

var queue = new Queue();

function readWord(word, cb?: () => void) {
    queue.add(function() {
        console.log("starting speech");
        (window as any).responsiveVoice.speak(word, "UK English Female", { onend: () => {
            console.log("ending speech");
            setTimeout(() => {
                if(typeof cb != 'undefined')
                    cb();
                this.next();
            }, 100);
            
        } });
    });
}

export { readWord };