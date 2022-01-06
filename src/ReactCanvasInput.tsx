
import { forwardRef, useEffect, useImperativeHandle, useState, useRef } from "react";


interface InputProps {
    placeholder?: string;
}

const ReactCanvasInput = forwardRef((props: InputProps, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ canvasInput, setCanvasInput ] = useState(null);
    useImperativeHandle(ref, () => {
        const refObj = {
            focus: () => canvasRef.current.focus()
        };
        Object.defineProperty(refObj, "value", {
            get: () => canvasInput.value(),
            set: (str) => {
                canvasInput.value(str);
            }
        })
        return refObj;
    }, [ canvasInput, canvasRef.current ]);
    useEffect(() => {
        let input = null;
        if(canvasRef.current != null)
            input = new (window as any).CanvasInput({
                canvas: canvasRef.current,
                fontSize: 18,
                fontFamily: 'Arial',
                fontColor: '#212121',
                fontWeight: 'bold',
                padding: 8,
                width: 200,
                height: 30,
                borderWidth: 1,
                borderColor: '#000',
                borderRadius: 3,
                boxShadow: '1px 1px 0px #fff',
                innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
                placeHolder: props.placeholder
            });
        setCanvasInput(input);
        return () => {
            if(input != null)
                input.destroy();
        };
    }, [ canvasRef.current ]);
    return <canvas width={218} height={48} ref={canvasRef}></canvas>;
});

export default ReactCanvasInput;