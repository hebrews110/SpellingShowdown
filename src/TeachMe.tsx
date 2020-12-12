
import { useState } from 'react';
import { readWord } from './talking';
const WordTeach = props => {
    const [ shownIndex, setShownIndex ] = useState(-1);
    const [ done, setDone ] = useState(false);
    return <li>
        <span className="spelling-word-number">{props.index}.</span>
        <span className="spelling-word-line"></span>
        <span className="spelling-word-text">
            {shownIndex != -1 && <span className="spelling-word-letters">
                {props.word.substr(0, shownIndex+1)}
            </span>}
            {shownIndex == -1 && !props.disabled && <a href="#" onClick={async(e) => {
                e.preventDefault();
                props.onClick();
                await new Promise<void>(resolve => readWord(props.word, resolve));
                for(var i = 0; i < props.word.length; i++) {
                    setShownIndex(i);
                    await new Promise<void>(resolve => readWord(props.word[i], resolve));
                }
                await new Promise<void>(resolve => readWord(props.word, resolve));
                await new Promise<void>(resolve => readWord(props.sentence, resolve));
                await new Promise<void>(resolve => readWord(props.word, resolve));
                setShownIndex(-1);
                setDone(true);
                props.onEnd();
            }}>{props.word}</a>}
            {shownIndex == -1 && props.disabled && <span className="spelling-word-disabled">{props.word}</span>}
        </span>
        {done && <span className="spelling-word-checkmark">✓</span>}
    </li>;
};
export default function TeachMe() {
    const [ wordPlaying, setWordPlaying ] = useState(null);
    return <div className="spelling-words-list">
        <b>Click on a word to learn how to use it!</b>
        <ol>
            {(window as any).spellingQuestions.map((question, index) => (
                <WordTeach index={index+1} sentence={question.sentence} key={question.name} word={question.name} disabled={wordPlaying != null} onClick={() => {
                    setWordPlaying(index);
                }} onEnd={() => setWordPlaying(null)}/>
            ))}
        </ol>
    </div>;
}