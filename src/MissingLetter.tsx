import { useEffect, useMemo, useRef, useState } from "react";
import { readWord, spellWord } from './talking';
import ReaderButton from './ReaderButton';
import shuffle from './shuffle';
import useForceUpdate from 'use-force-update';
import { getRandomIntInclusive, getRandomLetter } from "./getRandomInt";
import { useArrayState } from 'react-use-object-state';
import getParameterByName from './getParameterByName';

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

let NUM_MISSING_INDICES = null;
{
    /* try to use the parameter first */
    let numLettersMissing = getParameterByName("numLettersMissing");
    console.log(numLettersMissing);
    if(numLettersMissing != null) {
        NUM_MISSING_INDICES = parseInt(numLettersMissing);
    }
    if(NUM_MISSING_INDICES == null || isNaN(NUM_MISSING_INDICES))
        NUM_MISSING_INDICES = 1; /* default value */
}


export default function ReadAWord() {
    const forceUpdate = useForceUpdate();
    const [ question, setQuestion ] = useState(0);
    const answersRef = useRef([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const [ numAttempts, setNumAttempts ] = useState(0);
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
            readWord("Good job!", null, true);
            readWord("Try again!", null, true);
            if(question < ((window as any).spellingQuestions.length - 1)) {
                readWord((window as any).spellingQuestions[question+1].name, null, true);
            }
        }
    }, [ question, ready ]);
    const q = (window as any).spellingQuestions[question];
    const missingIndices = useArrayState([]);
    useEffect(() => {
        if(q == null)
            return;
        let indexes = new Set<number>();
        do {
            indexes.add(getRandomIntInclusive(0, q.name.length - 1));
        } while(indexes.size < Math.min(q.name.length, NUM_MISSING_INDICES));
        missingIndices.setState(Array.from(indexes));
    }, [q]);
    const mangledName = useMemo(() => {
        let name = q.name;
        for(var i = 0; i < missingIndices.state.length; i++) {
            let missingIndex = missingIndices.state[i];
            name = setCharAt(name, missingIndex, '_'); 
        }
        return name;
    }, [ missingIndices.state ]);
    const options: string[] = useMemo(() => {
        if(typeof q == 'undefined')
            return null;
        let options = (window as any).spellingQuestions.map(other => other.name) as string[];
        let letters = new Set<string>();
        let letter = "";
        missingIndices.state.forEach(missingIndex => {
            /* Always add the correct answer */
            letters.add(q.name.charAt(missingIndex));
        });
        while(letters.size < 6) {
            let tries = 0;
            const MAX_TRIES = 3;
            do {
                letter = getRandomLetter();
                tries++;
            } while(tries < MAX_TRIES && letters.has(letter));
            if(tries < MAX_TRIES)
                letters.add(letter);
        }
        let letterArray = Array.from(letters);
        shuffle(letterArray);
        
        return letterArray;
    }, [ question, missingIndices.state, setCharAt ]);
    const checkButton = (buttonIndex) => {
        let wasAMissingIndex = false;
        let numberMissingBeforeClick = missingIndices.state.length;
        for(let j = 0; j < missingIndices.state.length; j++) {
            let missingIndex = missingIndices.state[j];
            if(q.name.charAt(missingIndex) == options[buttonIndex]) {
                missingIndices.deleteAt(j);
                wasAMissingIndex = true;
                break;
            }
        }
        if(wasAMissingIndex && numberMissingBeforeClick == 1) {
            answersRef.current.push(q.name);
            readWord("Good job!");
            setQuestion(question + 1);
            setNumAttempts(0);
        }
        if(!wasAMissingIndex) {
            console.log("Force update", buttonIndex);
            readWord("Try again!");
            readWord(q.name);
            const newNumAttempts = numAttempts + 1;
            setNumAttempts(newNumAttempts);
            if(newNumAttempts == 2) {
                spellWord(q.name, true); /* prefetch */
            } else if(newNumAttempts == 3) {
                spellWord(q.name);
            }
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
            <h1 className="word-choice">{mangledName}</h1>
            {options.map((option, i) => <button className="word-choice" onClick={checkButton.bind(void 0, i)} key={q.name + ' ' + option + i}>{option}</button>)}
            <br/>
            <ReaderButton word={q.name}>Word</ReaderButton>
            <ReaderButton word={q.sentence}>Sentence</ReaderButton>
        </>}
        
    </div>;
}