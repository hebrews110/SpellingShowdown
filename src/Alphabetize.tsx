import { useEffect, useMemo, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import shuffle from "./shuffle";
import { readWord } from './talking';

// fake data generator
const getItems = count =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k}`,
    content: `item ${k}`
  }));

// a little function to help us with reordering the result
function reorder<T>(list: Iterable<T>|ArrayLike<T>, startIndex: number, endIndex: number): Array<T> {
  const result: Array<T> = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",

  cursor: 'pointer',

  // change background colour if dragging
  background: isDragging ? "lightgreen" : null,

  // styles we need to apply on draggables
  ...draggableStyle
});

function arraysEqual<T>(a1: Array<T>, a2: Array<T>): boolean {
    if(a1.length != a2.length)
        return false;
    for(var i = 0; i < a1.length; i++) {
        if(a1[i] != a2[i])
            return false;
    }
    return true;
}

export default function Alphabetize() {
    const [ showCorrect, setShowCorrect ] = useState(false);
    const [ ready, setReady ] = useState(false);
    const qData = useMemo(() => {
        let initialQs = null, sortedItems = null;
        do {
            shuffle((window as any).spellingQuestions);
            initialQs = (window as any).spellingQuestions.map(q => ({ id: q.name, content: q.name }));
            sortedItems = initialQs.slice().sort((a, b) => a.content.localeCompare(b.content));
        } while(arraysEqual(initialQs, sortedItems));
        return { initialQs, sortedItems };
    }, [ (window as any).spellingQuestions ]);
    const [ items, setItems ] = useState(qData.initialQs);
    const correct = arraysEqual(items, qData.sortedItems);
    const onDragEnd = (result) => {
        if(correct)
            return;
        // dropped outside the list
        if (!result.destination) {
            return;
        }
        readWord(result.draggableId);

        const newItems = reorder(
            items,
            result.source.index,
            result.destination.index
        );
        setItems(newItems);
    };
    useEffect(() => {
        if(!correct)
            return;
        var ind = setTimeout(() => {
            readWord("Perfect!");
            setShowCorrect(true);
        }, 1000);
        return () => clearTimeout(ind);
    }, [ correct ]);
    useEffect(() => {
        if(ready)
            readWord("Drag and drop the words into alphabetical order.");
    }, [ ready ]);

    if(!ready)
        return  <>
            <h1>Ready?</h1>
            <button className="reader-button" onClick={() => setReady(true)}>Begin</button>
        </>;
    if(showCorrect)
        return <h1>Perfect!</h1>;

    return <DragDropContext onDragEnd={onDragEnd}>
        <h3>Drag and drop the words into alphabetical order.</h3>
        <Droppable droppableId="droppable">
        {(provided, snapshot) => (
            <div
            className="spelling-words-list"
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{paddingTop: 0, paddingBottom: 0}}
            >
                <ol style={{marginBottom: 0}}>
                {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                        <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                        )}
                        >
                            <span className="spelling-word-number"></span>
                            <span className="spelling-word-line"></span>
                            <span className="spelling-word-text">{item.content}</span>
                        </li>
                    )}
                    </Draggable>
                ))}
                {provided.placeholder}
                </ol>
            </div>
        )}
        </Droppable>
    </DragDropContext>;
}