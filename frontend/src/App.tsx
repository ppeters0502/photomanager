// App.js
import AWS from 'aws-sdk';
import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GalleryContainer from './components/containers/GalleryContainer';
import HomeContainer from './components/containers/HomeContainer';

class App extends Component {

  // Original KidFantastic setup
  // AWS.config.update({
  //     accessKeyId: 'AKIAZVNQTE6FWMZ2J2QU',
  //     secretAccessKey:'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'
  // });

  async componentDidMount() {
    // const REGION = 'us-east-1';
    // const pool_id = process.env.REACT_APP_IDENTITY_POOL_ID;
    // try {
    //   // RobPetersPhoto setup
    //   AWS.config.update({
    //     accessKeyId: 'AKIA3ES4EFWBDOCTWSTA',
    //     secretAccessKey: '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',
    //     region: REGION
    //   }
    //   );
    //   console.log('AWS config updated.');
    // } catch (e) {
    //   console.log(e);
    // }
  }

  render() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<HomeContainer />} />
          <Route path="/gallery/:id" element={<GalleryContainer />} />
        </Routes>
      </Router>
    );
  }
}

export default App;
