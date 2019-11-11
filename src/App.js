import React from 'react';
import './App.css';
import FetchMachine from './fetchMachine';
import ToggleMachine from './toogleMachine';
import VideoMachine from './videoMachine';

function App() {
    return (
        <div className="App">
            <VideoMachine />
            <ToggleMachine />
            <FetchMachine />
        </div>
    );
}
export default App;
