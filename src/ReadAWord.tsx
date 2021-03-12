import { useEffect, useMemo, useRef, useState } from "react";
import { readWord } from './talking';
import ReaderButton from './ReaderButton';
import shuffle from './shuffle';
import useForceUpdate from 'use-force-update';


export default function ReadAWord() {
    const forceUpdate = useForceUpdate();
    const [ question, setQuestion ] = useState(0);
    const answersRef = useRef([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const optionsDisabled = useRef<boolean[]>([]);
    const [ ready, setReady ] = useState(false);
    useEffect(() => {
        if(ready) {
            readWord("Let's get started!");
            readWord("Good job!", null, true);
            readWord("Try again!", null, true);
        } else
            readWord("Let's get started!", null, true);
    }, [ ready ]);
    useEffect(() => {
        if(!ready)
            return;
        if(inputRef.current != null)
            inputRef.current.focus();
        if(question < (window as any).spellingQuestions.length) {
            readWord((window as any).spellingQuestions[question].name);
            if(question < ((window as any).spellingQuestions.length-1))
                readWord((window as any).spellingQuestions[question+1].name, null, true);
        }
    }, [ question, ready ]);
    const q = (window as any).spellingQuestions[question];
    const options: string[] = useMemo(() => {
        if(typeof q == 'undefined')
            return null;
        let options = shuffle((window as any).spellingQuestions.map(other => other.name) as string[]).slice(0, 4);
        if(options.indexOf(q.name) == -1) {
            options.pop();
            options.push(q.name);
            shuffle(options);
        }
        optionsDisabled.current = [];
        return options;
    }, [ question ]);
    const checkButton = (i) => {
        if(options[i] == q.name && !optionsDisabled.current[i]) {
            answersRef.current.push(q.name);
            readWord("Good job!");
            setQuestion(question + 1);
        } else {
            console.log("Force update", i);
            optionsDisabled.current[i] = true;
            readWord("Try again!");
            readWord(q.name);
            forceUpdate();
        }
    };
    if(question >= (window as any).spellingQuestions.length) {
        let points = answersRef.current.length;
        const numQs = (window as any).spellingQuestions.length;
        const pointsString = `You got ${points} out of ${numQs} points! That's ${Math.round((points/numQs)*100)}%!`;
        readWord(pointsString);
        return <b>{pointsString}</b>;
    }
    return <div className="spelling-test-question">
        {!ready && <>
            <h1>Ready?</h1>
            <button className="reader-button" onClick={() => setReady(true)}>Begin</button>
        </>}
        {ready && <>
            <h3>Listen to the word and choose the correct option.</h3>
            {options.map((option, i) => <button disabled={optionsDisabled.current[i]} className="word-choice" onClick={checkButton.bind(void 0, i)} key={option}>{option}</button>)}
            <br/>
            <ReaderButton word={q.name}>Word</ReaderButton>
            <ReaderButton word={q.sentence}>Sentence</ReaderButton>
        </>}
        
    </div>;
}