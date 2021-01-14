import { useState } from "react";
import { readWord } from './talking';
const ReaderButton = props => {
    const { word, onClick, ...rest } = props;
    const [ disabled, setDisabled ] = useState(false);
    const clickFn = (e) => {
        setDisabled(true);
        readWord(word, () => setDisabled(false));
        if(typeof onClick == 'function')
            onClick(e);
    }
    return <button className="reader-button" onClick={clickFn} disabled={disabled} {...rest}>{props.children}</button>;
}

export default ReaderButton;