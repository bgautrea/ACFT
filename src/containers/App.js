import React from 'react';
import standards from 'standards.json';
//import { getPassFail, getNextHighestKey } from 'utils/Helpers';
import { getPassFail, getNextLowestKey, getNextHighestKey } from 'utils/Helpers';
import Sidebar from 'components/Sidebar';
import Main from 'components/Main';
import Footer from 'components/Footer';
import ResultsDial from 'components/ResultsDial';

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      gender: 'male',
      age: '17-21',
      count: {
        mdl: '0',
        spt: '0.0',
        hrp: '0',
        sdcmin: '00',
        sdcsec: '00',
        plkmin: '00',
        plksec: '00',
        tmrmin: '00',
        tmrsec: '00'
      },
      score: {
        mdl: '0',
        spt: '0',
        hrp: '0',
        sdc: '0',
        plk: '0',
        tmr: '0',
        total: '0'
      },
      pass: {
        mdl: false,
        spt: false,
        hrp: false,
        sdc: false,
        plk: false,
        tmr: false
      },
      error: {
        mdl: false,
        spt: false,
        hrp: false,
        sdc: false,
        plk: false,
        tmr: false
      }
    }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const value = event.target.value;
    const id = event.target.id.replace('acft_', '');

    let gender = this.state.gender;
    let age = this.state.age;
    let score = { ...this.state.score };
    let count = { ...this.state.count };
    let pass = { ...this.state.pass };
    let error = { ...this.state.error };

    // assign changed value to corresponding item
    if (id.startsWith("gender_")) {
      gender = value;
      this.setState({ gender });
    } else if (id.startsWith("age_")) {
      age = value;
      this.setState({ age });
    } else if ('mdl' === id) {
      count.mdl = value;
    } else if ('spt' === id) {
      count.spt = value;
    } else if ('hrp' === id) {
      count.hrp = value;
    } else if ('sdcmin' === id) {
      count.sdcmin = value.padStart(2, "0");
    } else if ('sdcsec' === id) {
      count.sdcsec = value.padStart(2, "0");
    } else if ('plkmin' === id) {
      count.plkmin = value.padStart(2, "0");
    } else if ('plksec' === id) {
      count.plksec = value.padStart(2, "0");
    } else if ('tmrmin' === id) {
      count.tmrmin = value.padStart(2, "0");
    } else if ('tmrsec' === id) {
      count.tmrsec = value.padStart(2, "0");
    } else {
      alert('Something went wrong.');
    }

    // change object keys to arrays for easier sorting
    const mdlArray = Object.keys(standards[gender]['max-dead-lift']);
    const sptArray = Object.keys(standards[gender]['standing-power-throw']);
    const hrpArray = Object.keys(standards[gender]['hand-release-push-ups']);
    const sdcTimeArray = Object.keys(standards[gender]['sprint-drag-carry']);
    const plkTimeArray = Object.keys(standards[gender]['plank']);
    const tmrTimeArray = Object.keys(standards[gender]['two-mile-run']);

    // filter user reps to be within available range
    const mdlFinal = getNextHighestKey(mdlArray, count.mdl);
    const sptFinal = getNextLowestKey(sptArray, count.spt * 10);
    const hrpFinal = getNextHighestKey(hrpArray, count.hrp);

    // grab the scores from the json data
    score.mdl = standards[gender]['max-dead-lift'][mdlFinal][0][age];
    score.spt = standards[gender]['standing-power-throw'][sptFinal][0][age];
    score.hrp = standards[gender]['hand-release-push-ups'][hrpFinal][0][age];

    if ((count.sdcmin + count.sdcsec) === '0000') {
      score.sdc = 0;
    } else {
      // filter user sdc time to be taken from available time
      const sdcFinal = getNextHighestKey(sdcTimeArray, (count.sdcmin + count.sdcsec));
      score.sdc = standards[gender]['sprint-drag-carry'][sdcFinal][0][age];
    }
    if ((count.plkmin + count.plksec) === '0000') {
      score.plk = 0;
    } else {
      // filter user plank time to be taken from available time
      const plkFinal = getNextLowestKey(plkTimeArray, (count.plkmin + count.plksec));
      score.plk = standards[gender]['plank'][plkFinal][0][age];
      //score.plk = (count.plkmin + count.plksec);
    }
    if ((count.tmrmin + count.tmrsec) === '0000') {
      score.tmr = 0;
    } else {
      // filter user run time to be taken from available time
      const tmrFinal = getNextHighestKey(tmrTimeArray, (count.tmrmin + count.tmrsec));
      score.tmr = standards[gender]['two-mile-run'][tmrFinal][0][age];
    }
    score.total = score.mdl + score.spt + score.hrp + score.sdc + score.plk + score.tmr;

    // get pass/fail (boolean)
    pass.mdl = getPassFail(score.mdl);
    pass.spt = getPassFail(score.spt);
    pass.hrp = getPassFail(score.hrp);
    pass.sdc = getPassFail(score.sdc);
    pass.plk = getPassFail(score.plk);
    pass.tmr = getPassFail(score.tmr);

    this.setState({ score });
    this.setState({ count });
    this.setState({ pass });
    this.setState({ error });
  }

  render() {
    return (
      <div className="App">
        <Sidebar handleChange={this.handleChange} age={this.state.age} />
        <ResultsDial handleChange={this.handleChange} score={this.state.score} pass={this.state.pass} r="60" />
        <Main handleChange={this.handleChange} score={this.state.score} gender={this.state.gender} count={this.state.count} />
        <Footer />
      </div>
    );
  }
}

export default App;
