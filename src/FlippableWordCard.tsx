
import React, { useState } from 'react';
import classnames from 'classnames';

export default function FlippableWordCard(props) {
    return <div className={classnames("flip-card", props.flipped && "flip-card-flipped")} onClick={props.onClick}>
        <div className="flip-card-inner">
            <div className="flip-card-front">Spelling</div>
            <div className="flip-card-back">{props.children}</div>
        </div>
    </div>
}