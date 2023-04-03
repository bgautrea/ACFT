import React from 'react';
import './Main.css';

class Main extends React.Component {

    render() {
        return(
            <main className="Main">
                <div className="container">
                    <fieldset className="field">
                        <legend className="label">GENDER</legend>
                        <div className="gender-control" data-gender={this.props.gender}>
                            <div className="active-gender-slider"></div>
                            <div className="gender-group">
                                <input type='radio' id='acft_gender_1' value="male"
                                    onChange={this.props.handleChange}
                                    checked={this.props.gender === 'male'} />
                                <label htmlFor="acft_gender_1">Male</label>
                            </div>
                            <div className="gender-group">
                                <input type='radio' id='acft_gender_2' value="female"
                                    onChange={this.props.handleChange}
                                    checked={this.props.gender === 'female'} />
                                <label htmlFor="acft_gender_2">Female</label>
                            </div>
                        </div>
                    </fieldset>
                    <div className="field">
                        <label className="label" htmlFor="acft_mdl">MAX DEAD LIFT RAW SCORE</label>
                        <div className="control">
                            <input className="input" type="number" pattern="[0-9]*" min="0" step="10" inputMode="numeric" id="acft_mdl" onChange={this.props.handleChange} placeholder="0" />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label" htmlFor="acft_spt">STANDING POWER THROW RAW SCORE</label>
                        <div className="control">
                            <input className="input" type="number" pattern="[0-9].[0-9]*" step="0.1" min="0" inputMode="numeric" id="acft_spt" onChange={this.props.handleChange} placeholder="0.0" />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label" htmlFor="acft_hrp">HAND RELEASE PUSHUPS RAW SCORE</label>
                        <div className="control">
                            <input className="input" type="number" pattern="[0-9]*" min="0" inputMode="numeric" id="acft_hrp" onChange={this.props.handleChange} placeholder="0" />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <div className="field">
                                <label className="label" htmlFor="acft_sdcmin">SPRINT DRAG CARRY RAW SCORE</label>
                                <div className="control">
                                    <input className="input" type="number" pattern="[0-9]*" min="0" max="99" inputMode="numeric" id="acft_sdcmin" onChange={this.props.handleChange} placeholder="00" />
                                </div>
                            </div>
                        </div>
                        <div className="column">
                            <div className="field">
                                <label className="label" htmlFor="acft_sdcsec">&nbsp;</label>
                                <div className="control">
                                    <input className="input" type="number" pattern="[0-9]*" min="0" max="59" inputMode="numeric" id="acft_sdcsec" onChange={this.props.handleChange} placeholder="00" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <div className="field">
                                <label className="label" htmlFor="acft_plkmin">PLANK RAW SCORE</label>
                                <div className="control">
                                    <input className="input" type="number" pattern="[0-9]*" min="0" max="99" inputMode="numeric" id="acft_plkmin" onChange={this.props.handleChange} placeholder="00" />
                                </div>
                            </div>
                        </div>
                        <div className="column">
                            <div className="field">
                                <label className="label" htmlFor="acft_plksec">&nbsp;</label>
                                <div className="control">
                                    <input className="input" type="number" pattern="[0-9]*" min="0" max="59" inputMode="numeric" id="acft_plksec" onChange={this.props.handleChange} placeholder="00" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <div className="field">
                                <label className="label" htmlFor="acft_tmrmin">2-MILE RUN RAW SCORE</label>
                                <div className="control">
                                    <input className="input" type="number" pattern="[0-9]*" min="0" max="99" inputMode="numeric" id="acft_tmrmin" onChange={this.props.handleChange} placeholder="00" />
                                </div>
                            </div>
                        </div>
                        <div className="column">
                            <div className="field">
                                <label className="label" htmlFor="acft_tmrsec">&nbsp;</label>
                                <div className="control">
                                    <input className="input" type="number" pattern="[0-9]*" min="0" max="59" inputMode="numeric" id="acft_tmrsec" onChange={this.props.handleChange} placeholder="00" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        )
    }
}

export default Main;
