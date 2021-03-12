import { useEffect, useMemo, useRef, useState } from "react";
import { readWord } from './talking';
import ReaderButton from './ReaderButton';
import shuffle from './shuffle';
import useForceUpdate from 'use-force-update';
import FlippableWordCard from "./FlippableWordCard";
import 'core-js/features/array/fill';

function getAllIndexes<T>(arr: Array<T>, val: T): Array<number> {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}


export default function AudioWordMatch() {
    const cardsFlipped = useRef<boolean[]>([]);
    const newlyFlipped = useRef<boolean[]>([]);
    const forceUpdate = useForceUpdate();
    const cards = useMemo(() => {
        let cards = [];
        (window as any).spellingQuestions.forEach(q => {
            cards.push(q.name);
            cards.push(q.name);
        });
        shuffle(cards);
        cardsFlipped.current.fill(false, 0, cards.length);
        newlyFlipped.current.fill(false, 0, cards.length);
        (async function() {
            for(var i = 0; i < (window as any).spellingQuestions.length; i++) {
                await new Promise<void>(resolve => readWord((window as any).spellingQuestions[i].name, resolve, true));
            }
        })();
        return cards;
    }, [ (window as any).spellingQuestions ]);
    useEffect(() => {
        var i = setTimeout(() => {
            var len = newlyFlipped.current.filter(e => e).length;
            if(newlyFlipped.current.filter(e => e).length == 2) {
                const flippedCardIndexes = getAllIndexes(newlyFlipped.current, true);
                const word0 = cards[flippedCardIndexes[0]];
                const word1 = cards[flippedCardIndexes[1]];
                newlyFlipped.current.fill(false, 0, cards.length);
                if(word0 != word1) {
                    cardsFlipped.current[flippedCardIndexes[0]] = false;
                    cardsFlipped.current[flippedCardIndexes[1]] = false;
                }
                forceUpdate();
            }
        }, 1000);
        return () => clearTimeout(i);
    }, [ newlyFlipped.current.filter(e => e).length == 2 ]);
    const finished = newlyFlipped.current.indexOf(true) == -1 && cardsFlipped.current.filter(e => e).length == cards.length;
    useEffect(() => {
        if(finished) {
            readWord("Awesome work!", null, true);
            setTimeout(() => readWord("Awesome work!"), 1000);
        }
    }, [ finished ]);
    
    const onClick = (i) => {
        if(cardsFlipped.current[i] || newlyFlipped.current.filter(e => e).length >= 2)
            return;
        cardsFlipped.current[i] = true;
        newlyFlipped.current[i] = true;
        readWord(cards[i]);
        forceUpdate();
    }
    if(finished) {
        return <h1>Awesome work!</h1>;
    }
    return <>
        <h3>Click on the cards to see what word is under them. Match the words!</h3>
        <div className="audio-word-match">
            {cards.map((card, i) => <FlippableWordCard key={i} flipped={cardsFlipped.current[i]} onClick={onClick.bind(void 0, i)}>{card}</FlippableWordCard>)}
        </div>
    </>;
}