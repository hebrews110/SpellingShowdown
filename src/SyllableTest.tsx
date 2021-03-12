import { useEffect, useRef, useState } from "react";
import { readWord } from './talking';


export default function SyllableTest() {
    const [ question, setQuestion ] = useState(0);
    const [ niceWork, setNiceWork ] = useState(false);
    const answersRef = useRef([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const [ showingCorrect, setShowingCorrect ] = useState(false);
    const [ ready, setReady ] = useState(false);
    const q = (window as any).spellingQuestions[question];
    const nextQuestion = () => {
        if((question + 1) >= (window as any).spellingQuestions.length)
            setShowingCorrect(true);
        else
            setQuestion(question + 1);
    };
    const sayQuestion = () => {
        if(question < (window as any).spellingQuestions.length) {
            readWord("How many syllables does, \"" + q.name + "\", have?");
            /* prefetch */
            readWord("Excellent!", null, true);
            readWord("Nice work!", null, true);
            readWord("Not quite. Try again!", null, true);
            if(question < ((window as any).spellingQuestions.length - 1)) {
                readWord("How many syllables does, \"" + (window as any).spellingQuestions[question+1].name + "\", have?", null, true);
            }
        }
    };
    useEffect(() => {
        if(!ready) {
            if(typeof (window as any).syllableNums == 'undefined') {
                window.alert("Please provide the syllableNums array in the list file.");
            }
            return;
        }
        if(inputRef.current != null)
            inputRef.current.focus();
        sayQuestion();
    }, [ question, ready ]);
    useEffect(() => {
        if(showingCorrect)
            readWord("Excellent!");
    }, [ showingCorrect ]);
    const chooseOption = (index) => {
        if((window as any).syllableNums[question] == index) {
            setNiceWork(true);
            readWord("Nice work!", () => setNiceWork(false));
            nextQuestion();
        } else {
            readWord("Not quite. Try again!");
        }
    };
    if(showingCorrect) {
        return <div className="spelling-test-question">
            <h3>Excellent!</h3>
        </div>;
    }
    if(niceWork)
        return <div className="spelling-test-question">
            <h3>Nice work!</h3>
        </div>;
    return <div className="spelling-test-question">
        {!ready && <>
            <h1>Ready?</h1>
            <button className="reader-button" onClick={() => setReady(true)}>Begin</button>
        </>}
        {ready && <>
            <h3>({question+1} of {(window as any).spellingQuestions.length}) How many syllables does "{q.name}" have?</h3>
            <br/>
            <button className="reader-button" onClick={chooseOption.bind(void 0, 1)}>1 syllable</button>
            <button className="reader-button" onClick={chooseOption.bind(void 0, 2)}>2 syllables</button>
            <button className="reader-button" onClick={chooseOption.bind(void 0, 3)}>3 syllables</button>
            <button className="reader-button" onClick={chooseOption.bind(void 0, 4)}>4 syllables</button>
            <br/>
            <button className="reader-button" onClick={() => sayQuestion()}>Repeat question</button>
        </>}
        
    </div>
}