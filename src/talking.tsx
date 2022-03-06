
import Queue from 'js-queue';
import { Howl, Howler } from 'howler';

var queue = new Queue();


var loadingElement: HTMLDivElement = null;

var myAudioElement = document.createElement("audio");
var sourceElement = document.createElement("source");
sourceElement.src = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==";
myAudioElement.appendChild(sourceElement);


var localSpeechCache = {};



function readWord(word, cb?: () => void, prefetch = false) {
    if(word == null) {
        if(process.env.NODE_ENV == 'production')
            console.warn("word should not be null");
        else
            throw new Error("word should not be null");
        return;
    }
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
        document.body.appendChild(loadingElement);
    }
    const task = function() {
        const handleEnd = (id, e) => {
            if(!prefetch && word.trim().length > 0) {
                console.log("remove handlers on " + word);
                localSpeechCache[word].off('loaderror');
                localSpeechCache[word].off('playerror');
                localSpeechCache[word].off('end');
            }
            if(!prefetch)
                console.log("end handled");
            if(typeof e != 'undefined')
                console.error(e);
            if(!prefetch)
                loadingElement.style.display = "none";
            if(typeof cb == 'function')
                cb();
            if(!prefetch)
                this.next();
        }
        if(!prefetch) {
            console.log("starting speech", word + (prefetch ? " (prefetch)" : ""));
            if(myAudioElement != null) {
                myAudioElement.muted = true;
                const p = myAudioElement.play();
                if(p != null)
                    p.catch(e => {
                        console.log("cancelled fake play");
                    });
            }
            
        }
        if(word.trim().length == 0) {
            handleEnd(undefined, undefined);
        } else {
            var url = new URL("https://epallinone.com/quizzes/speech/");
            url.searchParams.append("text", word);
            var tmout = null;
            if(typeof localSpeechCache[word] == 'undefined') {
                /* Create the howl */
                var sound = new Howl({
                    src: [url.href],
                    format: ["mp3"],
                    preload: true,
                    html5: true,
                    onload: prefetch ? () => handleEnd(undefined, undefined) : undefined
                });
                localSpeechCache[word] = sound;
            } else if(prefetch)
                handleEnd(undefined, undefined);
            
            if(!prefetch) {
                var timeout = setTimeout(() => {
                    loadingElement.innerHTML = "<p>Loading speech file...</p>" + ((Howler as any)._audioUnlocked ? "" : "<p>Please tap the screen to allow audio playback.</p>");
                    loadingElement.style.display = "flex";
                }, 50);
                localSpeechCache[word].once("play", () => {
                    clearTimeout(timeout);
                    loadingElement.style.display = "none";
                });
                console.log("HOWL");
                localSpeechCache[word].once("loaderror", handleEnd);
                localSpeechCache[word].once("playerror", handleEnd);
                //localSpeechCache[word].once("stop", handleEnd);
                localSpeechCache[word].once("end", handleEnd);
                localSpeechCache[word].play();
            }
        }
        
    };
    if(!prefetch)
        queue.add(task);
    else
        task();
}

/**
 * Spell out the letters of a word to the user.
 * @param word The word to spell out
 * @param prefetchOnly Whether the word should actually be read, or just prefetched
 */
async function spellWord(word: string, prefetchOnly = false) {
    for(var i = 0; i < word.length; i++) {
        const prom = new Promise<void>(resolve => readWord(word[i], resolve, prefetchOnly));
        if(!prefetchOnly)
            await prom; /* wait for one letter to be spoken before moving to the next */
    }
}

export { readWord, spellWord };