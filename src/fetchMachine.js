import React from 'react';
import './App.css';
import { Machine, assign } from 'xstate';
import { useMachine } from '@xstate/react';

const allData = new Array(25).fill(0).map((_val, i) => i + 1);
const perPage = 10;

// on 是監聽的 key
const fetchMachine = Machine({
    id: 'toggle',
    initial: 'loading', // 初始狀態的 state key
    context: {
        data: []
    },
    states: {
        loading: {
            // invoke 算是 進入 loading 會先做的事情
            invoke: {
                id: 'dataLoader',
                src: (context, _event) => {
                    // callback 用來回調監聽（如果沒有用callback 也可以用 return 值，然後有onDone、onError 機制可以接收）
                    return (callback, _onEvent) => {
                        setTimeout(() => {
                            const { data } = context;
                            // _onEvent 可以用來像是如果我們 axios 想要 cancel 之類...目前還沒實作

                            // 可以取得
                            const newData = allData.slice(
                                data.length,
                                data.length + perPage
                            );
                            const hasMore = newData.length === perPage;
                            if (hasMore) {
                                console.log('1-1');
                                // 回調loading 內的 監聽
                                callback({
                                    type: 'DONE_MORE',
                                    newData
                                });
                            } else {
                                console.log('1-2');
                                // 回調loading 內的 監聽
                                callback({
                                    type: 'DONE_COMPLETE',
                                    newData
                                });
                            }
                        }, 1000);
                    };
                }
            },
            on: {
                // 當上面觸發 DONE_MORE
                DONE_MORE: {
                    target: 'more',
                    // 觸發時候執行的 function
                    actions: assign({
                        data: (context, event) => {
                            console.log('2-1');
                            const { newData = [] } = event;
                            return [...context.data, ...newData];
                        }
                    })
                },
                DONE_COMPLETE: {
                    target: 'complete',
                    // 觸發時候執行的 function
                    actions: assign({
                        data: (context, event) => {
                            console.log('2-2');
                            const { newData = [] } = event;
                            return [...context.data, ...newData];
                        }
                    })
                },
                FAIL: 'failure'
            }
        },
        more: {
            on: {
                // 監聽的 key 轉成 loading
                LOAD: 'loading'
            }
        },
        complete: {
            type: 'final'
        },
        failure: {
            type: 'final'
        }
    }
});

function FetchMachine() {
    const [current, send] = useMachine(fetchMachine);
    // 取得目前的 data
    const { data } = current.context;
    return (
        <div className="App">
            <h1>xstate</h1>
            <ul>
                {data.map((row) => (
                    <li
                        key={row}
                        style={{
                            background: 'orange',
                            border: '1px solid #000',
                            padding: '10px'
                        }}
                    >
                        {row}
                    </li>
                ))}

                {current.matches('loading') && <li>Loading...</li>}

                {current.matches('more') && (
                    <li style={{ background: 'green' }}>
                        <button
                            onClick={() => {
                                // 觸發 LOAD
                                send('LOAD');
                            }}
                        >
                            Load More
                        </button>
                    </li>
                )}
            </ul>
        </div>
    );
}

export default FetchMachine;
