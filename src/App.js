import React from 'react';
import './App.css';
import FetchMachine from './fetchMachine';
import ToggleMachine from './toogleMachine';

function App() {
    return (
        <div className="App">
            <ToggleMachine />
            <FetchMachine />
        </div>
    );
}
export default App;
