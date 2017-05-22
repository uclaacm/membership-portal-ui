import React, { PropTypes } from 'react'


class Button extends React.Component {
    
    render () {
        return(
            <div className={"button-component " + this.props.className}>
                <button className={"generic-button " + this.props.style}>{this.props.icon && <i className={"fa " + this.props.icon + " button-icon"} aria-hidden="true"></i>}{this.props.text}</button>
            </div>
        );
    }
}

export default Button;
