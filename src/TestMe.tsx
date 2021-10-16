import { useEffect, useMemo, useRef, useState } from "react";
import { readWord } from './talking';
import ReaderButton from './ReaderButton';
import ReactCanvasInput from './ReactCanvasInput';

export default function TestMe() {
    const [ question, setQuestion ] = useState(0);
    const answersRef = useRef([]);
    const inputRef = useRef(null);
    const [ showingCorrect, setShowingCorrect ] = useState(false);
    const [ ready, setReady ] = useState(false);
    const nextQuestion = () => {
        if(inputRef.current.value.trim().length == 0)
            return;
        answersRef.current.push(inputRef.current.value);
        inputRef.current.value = "";
        setQuestion(question + 1);
    };
    useEffect(() => {
        if(!ready)
            return;
        if(inputRef.current != null)
            inputRef.current.focus();
        (window as any).responsiveVoice.cancel();
        if(question < (window as any).spellingQuestions.length) {
            readWord((window as any).spellingQuestions[question].name);
            readWord((window as any).spellingQuestions[question].sentence, null, true);
            if(question < ((window as any).spellingQuestions.length-1))
                readWord((window as any).spellingQuestions[question+1].name, null, true);
        }
    }, [ question, ready ]);
    if(showingCorrect) {
        let points = 0;
        const rows = answersRef.current.map((v, i) => {
            const isCorrect = (window as any).spellingQuestions[i].name.toLowerCase() == answersRef.current[i].toLowerCase();
            if(isCorrect)
                points++;
            return <tr key={i}>
                <td>{(window as any).spellingQuestions[i].name}</td>
                <td>{answersRef.current[i]}</td>
                <td>{isCorrect ? 'Correct' : 'Incorrect'}</td>
            </tr>;
        });
        const pointsString = `You got ${points} out of ${answersRef.current.length} points! That's ${Math.round((points/answersRef.current.length)*100)}%!`;
        readWord(pointsString);
        return <>
            <b>{pointsString}</b>
            <table className="stylish-table">
                <thead>
                    <tr>
                        <th>Original word</th>
                        <th>Your spelling</th>
                        <th>Result</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </>;
    }
    if(question >= (window as any).spellingQuestions.length) {
        return <>
            <h3>Check your words below; hit Done when you are ready to move on!</h3>
            {answersRef.current.map((word, i) => <p key={i}>{word}</p>)}
            <button onClick={() => setShowingCorrect(true)}>Done</button>
        </>;
    }
    const q = (window as any).spellingQuestions[question];
    return <div className="spelling-test-question">
        {!ready && <>
            <h1>Ready?</h1>
            <button className="reader-button" onClick={() => setReady(true)}>Start</button>
        </>}
        {ready && <>
            <h3>({question+1} of {(window as any).spellingQuestions.length}) Type the word you hear into the box below, then click Next.</h3>
            <ReactCanvasInput ref={inputRef} placeholder="Word"/>
            <br/>
            <ReaderButton onClick={() => inputRef.current.focus()} word={q.name}>Word</ReaderButton>
            <ReaderButton onClick={() => inputRef.current.focus()} word={q.sentence}>Sentence</ReaderButton>
            <button className="reader-button" onClick={nextQuestion}>Next</button>
        </>}
        
    </div>
}
