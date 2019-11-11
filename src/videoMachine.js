import { Machine, assign } from 'xstate';
import { useMachine } from '@xstate/react';
import React from 'react';

import { percentage, minutes, seconds } from './utils';
import './reset.css';
import './App.css';

const videoMachine = Machine({
    id: 'video',
    initial: 'loading',

    context: {
        video: null, // pass ref to here
        duration: 0,
        elapsed: 0
    },

    states: {
        loading: {
            on: {
                LOADED: {
                    target: 'ready',
                    // update context 用 assign
                    actions: assign({
                        video: (_context, event) => {
                            // video 的 key 就是 send() 第二個參數
                            // 把 ref 的 video 物件 存到 context
                            return event.video;
                        },
                        duration: (_context, event) => {
                            return event.video.duration;
                        }
                    })
                },
                FAIL: 'failure'
            }
        },
        ready: {
            initial: 'paused',
            states: {
                paused: {
                    on: {
                        // actions 內的變數 為呼叫另外建立的 function ， but 必須傳到 useMachine 才會成功
                        PLAY: { target: 'playing', actions: ['playVideo'] }
                    }
                },
                playing: {
                    on: {
                        // actions 內的變數 為呼叫另外建立的 function ， but 必須傳到 useMachine 才會成功
                        PAUSE: { target: 'paused', actions: ['pauseVideo'] },
                        END: 'ended',
                        TIMEING: {
                            target: 'playing',
                            actions: assign({
                                elapsed: (context, _event) => {
                                    const { video } = context;
                                    return video.currentTime;
                                }
                            })
                        }
                    }
                },
                // 播放結束後，如過又發送 PLAY
                ended: {
                    on: {
                        PLAY: { target: 'playing', actions: ['restartVideo'] }
                    }
                }
            }
        },
        failure: {
            type: 'final'
        }
    }
});

// target 內的 actions 名稱
const playVideo = (context, _event) => {
    console.log('playVideo:');
    const { video } = context;
    video.play();
};

const pauseVideo = (context, _event) => {
    const { video } = context;
    video.pause();
};

const restartVideo = (context, _event) => {
    console.log('restartVideo:');
    const { video } = context;
    video.currentTime = 0;
    video.play();
};

function SearchMachine() {
    const ref = React.useRef(null);
    const [current, send] = useMachine(videoMachine, {
        // 注入 actions
        actions: { playVideo, pauseVideo, restartVideo }
    });
    const { duration, elapsed } = current.context;
    return (
        <div className="container">
            <h1>xstate-search</h1>
            <video
                ref={ref}
                // 可以播放 trigger
                onCanPlay={() => {
                    // 第二個參數 就是 actions 第二個參數用
                    send('LOADED', {
                        video: ref.current
                    });
                }}
                // 失敗
                onError={() => {
                    send('FAIL');
                }}
                onTimeUpdate={() => {
                    send('TIMEING');
                }}
                onEnded={() => {
                    console.log('3333');
                    send('END');
                }}
                controls
            >
                <source src="/fox.mp4" type="video/mp4" />
            </video>
            <div>
                <ElapsedBar elapsed={elapsed} duration={duration} />
                <Buttons current={current} send={send} />
                <Timer elapsed={elapsed} duration={duration} />
            </div>
        </div>
    );
}

const Buttons = ({ current, send }) => {
    if (current.matches({ ready: 'playing' })) {
        return (
            <button
                onClick={() => {
                    send('PAUSE');
                }}
            >
                Pause
            </button>
        );
    }

    return (
        <button
            onClick={() => {
                send('PLAY');
            }}
        >
            Play
        </button>
    );
};

const ElapsedBar = ({ elapsed, duration }) => (
    <div className="elapsed">
        <div
            className="elapsed-bar"
            style={{ width: `${percentage(duration, elapsed)}%` }}
        />
    </div>
);

const Timer = ({ elapsed, duration }) => (
    <span className="timer">
        {minutes(elapsed)}:{seconds(elapsed)} of {minutes(duration)}:
        {seconds(duration)}
    </span>
);

export default SearchMachine;
