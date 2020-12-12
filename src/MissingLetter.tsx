import { useEffect, useMemo, useRef, useState } from "react";
import { readWord } from './talking';
import ReaderButton from './ReaderButton';
import shuffle from './shuffle';
import useForceUpdate from 'use-force-update';
import { getRandomIntInclusive, getRandomLetter } from "./getRandomInt";

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

export default function ReadAWord() {
    const forceUpdate = useForceUpdate();
    const [ question, setQuestion ] = useState(0);
    const answersRef = useRef([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const optionsDisabled = useRef<boolean[]>([]);
    const [ ready, setReady ] = useState(false);
    useEffect(() => {
        if(ready)
            readWord("Let's get started!");
    }, [ ready ]);
    useEffect(() => {
        if(!ready)
            return;
        if(inputRef.current != null)
            inputRef.current.focus();
        if(question < (window as any).spellingQuestions.length) {
            readWord((window as any).spellingQuestions[question].name);
        }
    }, [ question, ready ]);
    const q = (window as any).spellingQuestions[question];
    const missingIndex = useMemo(() => getRandomIntInclusive(0, q?.name.length - 1), [ q ]);
    const options: string[] = useMemo(() => {
        if(typeof q == 'undefined')
            return null;
        let options = (window as any).spellingQuestions.map(other => other.name) as string[];
        let letters = [];
        let letter = "";
        for(var i = 0; i < 3; i++) {
            do {
                letter = getRandomLetter();
            } while(options.indexOf(setCharAt(q.name, missingIndex, letter)) != -1);
            letters.push(letter);
        }
        letters.push(q.name.charAt(missingIndex));
        shuffle(letters);
        
        optionsDisabled.current = [];
        return letters;
    }, [ question, missingIndex, setCharAt ]);
    const checkButton = (i) => {
        if(q.name.charAt(missingIndex) == options[i] && !optionsDisabled.current[i]) {
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
            <h1 className="word-choice">{setCharAt(q.name, missingIndex, '_')}</h1>
            {options.map((option, i) => <button disabled={optionsDisabled.current[i]} className="word-choice" onClick={checkButton.bind(void 0, i)} key={option}>{option}</button>)}
            <br/>
            <ReaderButton word={q.name}>Word</ReaderButton>
            <ReaderButton word={q.sentence}>Sentence</ReaderButton>
        </>}
        
    </div>;
}