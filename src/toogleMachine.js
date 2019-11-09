import React from 'react';
import './App.css';
import { Machine } from 'xstate';
import { useMachine } from '@xstate/react';
const fetchMachine = Machine({
    id: 'toggle',
    initial: 'inactive',
    // 要切換的 state 狀態
    states: {
        inactive: {
            // 觸發到toggle 話就轉成 "active" 的 state狀態
            on: {
                TOGGLE: 'active' // 這個必須對應到 states 你要轉換的 key
            }
        },
        active: {
            on: {
                TOGGLE: 'inactive'
            }
        }
    }
});

function ToggleMachine() {
    const [current, send] = useMachine(fetchMachine);
    return (
        <div className="App">
            <h1>xstate</h1>
            <button onClick={() => send('TOGGLE')}>toggle</button>
            <div>current: {current.value}</div>
            {current.matches('active') ? 'sucess' : 'fail'}
        </div>
    );
}

export default ToggleMachine;;
