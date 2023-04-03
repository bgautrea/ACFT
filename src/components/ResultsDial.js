import React from 'react';
import './ResultsDial.css';
import { getCircumference } from 'utils/Helpers';

class ResultsDial extends React.Component {

    getOffset(r, score) {
        return (getCircumference(r) / 300) * score;
    }

    render() {
        return(
            <div className="ResultsDial">
                <div className="container">
                    <div className="dial-wrapper">
                        <div className="total-group">
                            <p className="label">TOTAL POINTS</p>
                            <p className="score">{this.props.score.total}</p>
                        </div>
                        <div className="score-group">
                            <div className="columns">
                                <div className="column">
                                    <p className="label">MDL</p>
                                    <p className="score">{this.props.score.mdl}</p>
                                </div>
                                <div className="column">
                                    <p className="label">SPT</p>
                                    <p className="score">{this.props.score.spt}</p>
                                </div>
                                <div className="column">
                                    <p className="label">HRP</p>
                                    <p className="score">{this.props.score.hrp}</p>
                                </div>
                            </div>
                            <div className="columns">
                                <div className="column">
                                    <p className="label">SDC</p>
                                    <p className="score">{this.props.score.sdc}</p>
                                </div>
                                <div className="column">
                                    <p className="label">PLK</p>
                                    <p className="score">{this.props.score.plk}</p>
                                </div>
                                <div className="column">
                                    <p className="label">2MR</p>
                                    <p className="score">{this.props.score.tmr}</p>
                                </div>
                            </div>
                        </div>
                        <div className="svg radial-progress">
                            {/* ViewBox should should be double the radius. */}
                            <svg viewBox="0 0 140 140" preserveAspectRatio="xMinYMin meet" xmlSpace="preserve" xmlnsXlink="http://www.w3.org/1999/xlink">
                                <circle className="radial-progress-background"
                                    r={this.props.r}
                                    cx="50%"
                                    cy="50%"
                                    fill="transparent"
                                    strokeDasharray={getCircumference(this.props.r)}
                                    strokeDashoffset="0">
                                </circle>
                                <circle className="radial-progress-cover"
                                    r={this.props.r}
                                    cx="50%"
                                    cy="50%"
                                    fill="transparent"
                                    strokeDasharray={getCircumference(this.props.r)}
                                    strokeDashoffset={this.getOffset(this.props.r, this.props.score.total)}>
                                </circle>
                                <circle className="radial-progress-center"
                                    r={this.props.r}
                                    cx="50%"
                                    cy="50%"
                                    fill="transparent"
                                    strokeDasharray={getCircumference(this.props.r)}
                                    strokeDashoffset="0">
                                </circle>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ResultsDial;
