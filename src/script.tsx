
import ReactDOM from 'react-dom';
import { useEffect, useMemo, useState } from 'react';
import TeachMe from './TeachMe';
import TestMe from './TestMe';
import ReadAWord from './ReadAWord';
import MissingLetter from './MissingLetter';
import AudioWordMatch from './AudioWordMatch';
import shuffle from './shuffle';

function getParameterByName(name: string, url = window.location.href): string|null {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
const list = getParameterByName("list");

window.onload = function() {
    const script = document.createElement("script");
    script.onload = function() {
        if(typeof (window as any).spellingQuestions == 'undefined') {
            (window as any).spellingQuestions = [];
            for(var i = 0; i < (window as any).list.length; i++) {
                (window as any).spellingQuestions.push({ name: (window as any).list[i], sentence: (window as any).sentences[i] });
            }
        }
        if(typeof (window as any).title != 'undefined')
            document.title = (window as any).title;
        function App() {
            const initial = useMemo(() => getParameterByName("game"), []);
            const [ game, setGame ] = useState(initial);
            const gotoGame = (game) => {
                window.location.href = window.location.href + "&game=" + game;
            };
            if(game == "AudioWordMatch" || game == "TestMe") {
                var maxQuestions = (game == "AudioWordMatch" ? 9 : 20);
                if((window as any).spellingQuestions.length > maxQuestions) {
                    shuffle((window as any).spellingQuestions);
                    (window as any).spellingQuestions = (window as any).spellingQuestions.slice(0, maxQuestions);
                }
            }
            if(game == "TeachMe")
                return <TeachMe/>;
            else if(game == "TestMe")
                return <TestMe/>;
            else if(game == "ReadAWord")
                return <ReadAWord/>;
            else if(game == "MissingLetter")
                return <MissingLetter/>;
            else if(game == "AudioWordMatch")
                return <AudioWordMatch/>;
            else
                return <>
                    <h1>Choose a game:</h1>
                    <div className="game-chooser">
                        <button onClick={() => gotoGame("TeachMe")}>Teach Me</button>
                        <button onClick={() => gotoGame("TestMe")}>Test Me</button>
                        <button onClick={() => gotoGame("ReadAWord")}>Read a Word</button>
                        <button onClick={() => gotoGame("MissingLetter")}>Missing Letter</button>
                        <button onClick={() => gotoGame("AudioWordMatch")}>Audio Word Match</button>
                    </div>  
                </>
        }
        ReactDOM.render(<App/>, document.getElementById("game-container"));
    };
    script.src = 'lists/' + list;
    document.head.appendChild(script);
    
}