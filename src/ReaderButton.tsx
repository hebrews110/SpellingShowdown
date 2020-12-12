import { useState } from "react";
import { readWord } from './talking';
const ReaderButton = props => {
    const { word, ...rest } = props;
    const [ disabled, setDisabled ] = useState(false);
    const onClick = () => {
        setDisabled(true);
        readWord(word, () => setDisabled(false));
    }
    return <button className="reader-button" onClick={onClick} disabled={disabled} {...rest}>{props.children}</button>;
}

export default ReaderButton;