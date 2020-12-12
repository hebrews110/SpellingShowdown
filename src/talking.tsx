
import 'talkify-tts/dist/talkify.min.js';
import Queue from 'js-queue';

var queue = new Queue();

function readWord(word, cb?: () => void) {
    queue.add(function() {
        (window as any).responsiveVoice.speak(word, "UK English Female", { onend: () => {
            if(typeof cb != 'undefined')
                cb();
            this.next();
        } });
    });
}

export { readWord };